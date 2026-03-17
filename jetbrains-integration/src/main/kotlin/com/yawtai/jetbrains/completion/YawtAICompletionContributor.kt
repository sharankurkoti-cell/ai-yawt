package com.yawtai.jetbrains.completion

import com.intellij.codeInsight.completion.*
import com.intellij.codeInsight.lookup.*
import com.intellij.openapi.application.ApplicationManager
import com.intellij.openapi.editor.Editor
import com.intellij.openapi.progress.ProgressManager
import com.intellij.openapi.project.Project
import com.intellij.openapi.util.TextRange
import com.intellij.psi.*
import com.intellij.psi.util.PsiTreeUtil
import com.intellij.util.ProcessingContext
import kotlinx.coroutines.*
import org.jetbrains.annotations.NotNull

class YawtAICompletionContributor : CompletionContributor() {
    
    private val yawtAIService = YawtAIService()
    
    override fun fillCompletionVariants(
        parameters: CompletionParameters,
        result: CompletionResultSet,
        context: ProcessingContext
    ) {
        val editor = parameters.editor
        val document = editor.document
        val prefix = findPrefix(parameters)
        
        if (prefix.length < 2) return
        
        val project = parameters.originalFile.project
        
        // Get context from current file
        val currentCode = document.text
        val cursorPosition = editor.caretModel.offset
        
        // Get completion from YawtAI service
        GlobalScope.launch(Dispatchers.IO) {
            try {
                val completions = yawtAIService.getCompletions(
                    code = currentCode,
                    cursorPosition = cursorPosition,
                    language = parameters.originalFile.language,
                    context = getContextInfo(project)
                )
                
                // Convert to IntelliJ completion suggestions
                val lookupElements = completions.map { completion ->
                    LookupElementBuilder.create(completion.text)
                        .withPresentableText(completion.displayText)
                        .withTailText(completion.insertText)
                        .withTypeText(completion.type)
                        .withIcon(com.intellij.icons.AllIcons.Actions.Find)
                        .withInsertHandler { context, item ->
                            // Insert completion
                            val editor = context.editor
                            val document = editor.document
                            val offset = context.startOffset
                            
                                    WriteCommandAction.runWriteCommandAction(project) {
                                        document.replaceString(
                                            TextRange(offset, offset + prefix.length),
                                            completion.insertText
                                        )
                                    }
                            true
                        }
                }
                
                // Add to result set
                ApplicationManager.getApplication().invokeLater {
                    result.withElementsMatcher(CompletionMatchers.always())
                        .addAllElements(lookupElements)
                        .finishCaseInsensitive()
                        .stopHere()
                }
                
            } catch (e: Exception) {
                // Log error but don't fail completion
                println("YawtAI completion error: ${e.message}")
            }
        }
    }
    
    private fun findPrefix(parameters: CompletionParameters): String {
        val offset = parameters.offset
        val document = parameters.editor.document
        
        return if (offset > 0) {
            val text = document.charsSequence.subSequence(0, offset).toString()
            findLastNonAlphanumericCharacter(text, offset - 1)
        } else {
            ""
        }
    }
    
    private fun findLastNonAlphanumericCharacter(text: String, start: Int): String {
        for (i in start downTo 0) {
            val c = text[i]
            if (!c.isLetterOrDigit() && c != '_') {
                return text.substring(i + 1)
            }
        }
        return text
    }
    
    private fun getContextInfo(project: Project?): String {
        if (project == null) return ""
        
        val stringBuilder = StringBuilder()
        
        // Add project structure context
        PsiTreeUtil.findChildrenOfAnyType(project, PsiFile::class.java)
            .take(10)
            .forEach { file ->
                stringBuilder.append("File: ${file.name}\n")
                if (file is PsiJavaFile) {
                    val classes = PsiTreeUtil.findChildrenOfType(file, PsiClass::class.java)
                    classes.take(5).forEach { cls ->
                        stringBuilder.append("  Class: ${cls.name}\n")
                        cls.methods.take(3).forEach { method ->
                            stringBuilder.append("    Method: ${method.name}\n")
                        }
                    }
                }
            }
        
        return stringBuilder.toString()
    }
    
    private fun Char.isLetterOrDigit(): Boolean {
        return this.isLetterOrDigit()
    }
}
