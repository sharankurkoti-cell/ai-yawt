plugins {
    id("java")
    id("org.jetbrains.kotlin.jvm")
    id("org.jetbrains.intellij")
}

group = "com.yawtai"
version = "1.0.0"

repositories {
    mavenCentral()
}

dependencies {
    implementation("org.jetbrains.kotlin:kotlin-stdlib:1.8.0")
    implementation("org.jetbrains:annotations:24.0.1")
    implementation("com.google.code.gson:gson:2.9.0")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.7.1")
    
    // IntelliJ Platform SDK
    compileOnly("com.jetbrains.intellij.platform:core:213.6777.50")
    compileOnly("com.jetbrains.intellij.platform:lang-core:213.6777.50")
    compileOnly("com.jetbrains.intellij.platform:code-insight:213.6777.50")
    compileOnly("com.jetbrains.intellij.platform:editor:213.6777.50")
    compileOnly("com.jetbrains.intellij.platform:project-model:213.6777.50")
    compileOnly("com.jetbrains.intellij.platform:util:213.6777.50")
    
    testImplementation("junit:junit:4.13.2")
    testImplementation("org.jetbrains.kotlin:kotlin-test-junit:1.8.0")
}

intellij {
    version.set("213.6777.50")
    type.set("IC") // IntelliJ IDEA Community Edition
    plugins.set(listOf("com.intellij.java"))
}

tasks {
    withType<JavaCompile> {
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
    }
    
    withType<org.jetbrains.kotlin.gradle.tasks.KotlinCompile> {
        kotlinOptions.jvmTarget = "11"
    }
    
    patchPluginXml {
        sinceBuild.set("213")
        untilBuild.set("231.*")
    }
    
    signPlugin {
        certificateChain.set(System.getenv("CERTIFICATE_CHAIN"))
        privateKey.set(System.getenv("PRIVATE_KEY"))
        password.set(System.getenv("PRIVATE_KEY_PASSWORD"))
    }
    
    publishPlugin {
        token.set(System.getenv("PUBLISH_TOKEN"))
    }
}
