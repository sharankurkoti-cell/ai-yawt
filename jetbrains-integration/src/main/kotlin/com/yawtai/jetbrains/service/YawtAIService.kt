package com.yawtai.jetbrains.service

import com.google.gson.Gson
import com.intellij.openapi.application.ApplicationManager
import com.intellij.openapi.diagnostic.Logger
import com.intellij.openapi.progress.ProgressIndicator
import com.intellij.openapi.progress.ProgressManager
import com.intellij.openapi.project.Project
import com.intellij.util.io.HttpRequests
import kotlinx.coroutines.*
import org.jetbrains.annotations.NotNull
import java.net.http.HttpURLConnection
import java.net.URL
import java.nio.charset.StandardCharsets

data class YawtAICompletion(
    val text: String,
    val displayText: String,
    val insertText: String,
    val type: String,
    val confidence: Double
)

data class YawtAIRequest(
    val code: String,
    val cursorPosition: Int,
    val language: String,
    val context: String
)

data class YawtAIResponse(
    val success: Boolean,
    val completions: List<YawtAICompletion>,
    val error: String?
)

class YawtAIService {
    private val logger = Logger.getInstance(YawtAIService::class.java)
    private val gson = Gson()
    private val apiUrl = System.getProperty("yawtai.api.url", "http://localhost:3002/generation")
    private val apiKey = System.getProperty("yawtai.api.key", "")
    
    suspend fun getCompletions(
        @NotNull code: String,
        @NotNull cursorPosition: Int,
        @NotNull language: String,
        @NotNull context: String
    ): List<YawtAICompletion> = withContext(Dispatchers.IO) {
        try {
            val request = YawtAIRequest(code, cursorPosition, language, context)
            val requestBody = gson.toJson(request)
            
            val response = makeHttpRequest("$apiUrl/inline-completion", requestBody)
            val responseObj = gson.fromJson(response, YawtAIResponse::class.java)
            
            if (responseObj.success) {
                responseObj.completions
            } else {
                logger.error("YawtAI API error: ${responseObj.error}")
                emptyList()
            }
        } catch (e: Exception) {
            logger.error("Error getting completions from YawtAI", e)
            emptyList()
        }
    }
    
    suspend fun sendChatMessage(
        @NotNull message: String,
        @NotNull context: String,
        @NotNull language: String
    ): String = withContext(Dispatchers.IO) {
        try {
            val request = mapOf(
                "message" to message,
                "context" to context,
                "language" to language
            )
            val requestBody = gson.toJson(request)
            
            val response = makeHttpRequest("$apiUrl/chat", requestBody)
            val responseObj = gson.fromJson(response, Map::class.java)
            
            return@withContext responseObj["response"]?.toString() ?: "Error: No response received"
        } catch (e: Exception) {
            logger.error("Error sending chat message to YawtAI", e)
            "Error: ${e.message}"
        }
    }
    
    suspend fun analyzeCode(
        @NotNull code: String,
        @NotNull action: String,
        @NotNull language: String,
        @NotNull context: String
    ): String = withContext(Dispatchers.IO) {
        try {
            val request = mapOf(
                "code" to code,
                "action" to action,
                "language" to language,
                "context" to context
            )
            val requestBody = gson.toJson(request)
            
            val response = makeHttpRequest("$apiUrl/analyze", requestBody)
            val responseObj = gson.fromJson(response, Map::class.java)
            
            return@withContext responseObj["result"]?.toString() ?: "Error: No analysis received"
        } catch (e: Exception) {
            logger.error("Error analyzing code with YawtAI", e)
            "Error: ${e.message}"
        }
    }
    
    suspend fun generateCodeFromPrompt(
        @NotNull prompt: String,
        @NotNull language: String,
        @NotNull context: String
    ): String = withContext(Dispatchers.IO) {
        try {
            val request = mapOf(
                "prompt" to prompt,
                "language" to language,
                "context" to context
            )
            val requestBody = gson.toJson(request)
            
            val response = makeHttpRequest("$apiUrl/generate-from-prompt", requestBody)
            val responseObj = gson.fromJson(response, Map::class.java)
            
            return@withContext responseObj["result"]?.toString() ?: "Error: No code generated"
        } catch (e: Exception) {
            logger.error("Error generating code with YawtAI", e)
            "Error: ${e.message}"
        }
    }
    
    suspend fun searchRepository(
        @NotNull query: String,
        @NotNull repositoryPath: String,
        @NotNull maxResults: Int
    ): List<Map<String, Any>> = withContext(Dispatchers.IO) {
        try {
            val request = mapOf(
                "query" to query,
                "repositoryPath" to repositoryPath,
                "maxResults" to maxResults
            )
            val requestBody = gson.toJson(request)
            
            val response = makeHttpRequest("$apiUrl/search/repository", requestBody)
            val responseObj = gson.fromJson(response, Map::class.java)
            
            @Suppress("UNCHECKED_CAST")
            return@withContext responseObj["results"] as? List<Map<String, Any>> ?: emptyList()
        } catch (e: Exception) {
            logger.error("Error searching repository with YawtAI", e)
            emptyList()
        }
    }
    
    private suspend fun makeHttpRequest(@NotNull url: String, @NotNull body: String): String {
        return withContext(Dispatchers.IO) {
            try {
                val connection = URL(url).openConnection() as HttpURLConnection
                connection.requestMethod = "POST"
                connection.setRequestProperty("Content-Type", "application/json")
                connection.setRequestProperty("Accept", "application/json")
                connection.setRequestProperty("Authorization", "Bearer $apiKey")
                connection.doOutput = true
                
                // Write request body
                connection.outputStream.use { output ->
                    output.write(body.toByteArray(StandardCharsets.UTF_8))
                }
                
                // Read response
                val responseCode = connection.responseCode
                if (responseCode == HttpURLConnection.HTTP_OK) {
                    connection.inputStream.bufferedReader().use { reader ->
                        reader.readText()
                    }
                } else {
                    throw Exception("HTTP error: $responseCode")
                }
            } catch (e: Exception) {
                throw Exception("Failed to make HTTP request: ${e.message}", e)
            }
        }
    }
    
    fun dispose() {
        // Cleanup resources if needed
    }
}
