"""
CareerIQ — Career catalog (roles, skills, jobs, learning links) and resume role detection.

The original dataset only covered data/analytics careers, so a resume for e.g. an
Android Developer could never match anything relevant. This module:

1. Holds a wider catalog (mobile, web, software, cloud/DevOps, security, design,
   QA and data roles) and `seed_career_catalog()` adds whatever is missing to the
   database. It is idempotent: rows that already exist are never changed or duplicated.
2. Knows which words in a resume title point to which career role
   (`detect_role_name`), and which roles belong to the same career family
   (`title_fit`), used by the matching engine to rank roles and jobs.
"""
import re
from datetime import date, timedelta
from typing import Dict, List, Optional, Tuple

from sqlalchemy.orm import Session

from app.models import (
    Skill, SkillAlias, CareerRole, CareerRoleSkill, Job, JobSkill,
    LearningResource, LearningResourceSkill,
)

# -----------------------------------------------------------------------------
# Skills: name -> (aliases found in resumes, learning resource (title, provider, url))
# Existing skills (Python, SQL, React, Git, AWS Cloud Basics, ...) are reused by name.
# -----------------------------------------------------------------------------
NEW_SKILLS: Dict[str, Tuple[List[str], Optional[Tuple[str, str, str]]]] = {
    # Mobile
    "Kotlin": (["kotlin coroutines", "coroutines"], ("Kotlin Language Documentation", "JetBrains", "https://kotlinlang.org/docs/home.html")),
    "Java": (["core java", "java 8", "java se", "j2se"], ("Learn Java", "Oracle dev.java", "https://dev.java/learn/")),
    "Android SDK": (["android", "android development", "android app development", "android studio"], ("Android Basics with Compose", "Android Developers", "https://developer.android.com/courses")),
    "Jetpack Compose": (["jetpack", "compose ui"], ("Jetpack Compose Tutorial", "Android Developers", "https://developer.android.com/compose")),
    "XML Layouts": (["xml", "constraintlayout", "constraint layout"], ("Layouts in Views", "Android Developers", "https://developer.android.com/develop/ui/views/layout/declaring-layout")),
    "MVVM Architecture": (["mvvm", "mvp", "clean architecture", "app architecture"], ("Guide to App Architecture", "Android Developers", "https://developer.android.com/topic/architecture")),
    "SQLite": (["room database", "room db", "sqlite database"], ("Save Data with Room", "Android Developers", "https://developer.android.com/training/data-storage/room")),
    "Firebase": (["firestore", "firebase auth", "firebase realtime database"], ("Firebase Documentation", "Google", "https://firebase.google.com/docs")),
    "REST APIs": (["rest api", "restful", "restful apis", "retrofit", "api integration", "web services"], ("REST API Tutorial", "restfulapi.net", "https://restfulapi.net/")),
    "Swift": (["swift 5", "swift programming"], ("Swift Documentation", "Swift.org", "https://www.swift.org/documentation/")),
    "SwiftUI": (["swift ui"], ("SwiftUI Tutorials", "Apple Developer", "https://developer.apple.com/tutorials/swiftui")),
    "Xcode": (["cocoapods", "uikit"], ("Xcode Overview", "Apple Developer", "https://developer.apple.com/xcode/")),
    "Flutter": (["flutter sdk", "flutter development"], ("Flutter Documentation", "Google", "https://docs.flutter.dev/")),
    "Dart": (["dart language"], ("Dart Language Tour", "dart.dev", "https://dart.dev/language")),
    # Web
    "HTML": (["html5"], ("Learn Web Development: HTML", "MDN Web Docs", "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content")),
    "CSS": (["css3", "scss", "sass", "tailwind", "tailwind css", "bootstrap"], ("Learn Web Development: CSS", "MDN Web Docs", "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics")),
    "JavaScript": (["js", "es6", "javascript es6", "vanilla js"], ("JavaScript Guide", "MDN Web Docs", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide")),
    "TypeScript": (["typescript language"], ("TypeScript Handbook", "Microsoft", "https://www.typescriptlang.org/docs/")),
    "Responsive Web Design": (["responsive design", "media queries", "mobile first design"], ("Responsive Web Design", "freeCodeCamp", "https://www.freecodecamp.org/learn/2022/responsive-web-design/")),
    "Node.js": (["nodejs", "node js", "node"], ("Learn Node.js", "OpenJS Foundation", "https://nodejs.org/en/learn")),
    "Express.js": (["expressjs", "express js"], ("Express Getting Started", "OpenJS Foundation", "https://expressjs.com/en/starter/installing.html")),
    "MongoDB": (["mongo", "mongoose", "nosql"], ("MongoDB University", "MongoDB", "https://learn.mongodb.com/")),
    "Django": (["django rest framework", "drf"], ("Writing Your First Django App", "Django", "https://docs.djangoproject.com/en/stable/intro/tutorial01/")),
    "Spring Boot": (["spring framework", "spring mvc"], ("Building an Application with Spring Boot", "Spring", "https://spring.io/guides/gs/spring-boot")),
    "Hibernate / JPA": (["hibernate", "jpa"], ("Hibernate ORM Getting Started", "Hibernate", "https://hibernate.org/orm/documentation/")),
    # Software fundamentals
    "Data Structures & Algorithms": (["data structures", "algorithms", "dsa", "data structures and algorithms"], ("DSA Tutorial", "GeeksforGeeks", "https://www.geeksforgeeks.org/learn-data-structures-and-algorithms-dsa-tutorial/")),
    "Object-Oriented Programming": (["object oriented programming", "oop", "oops"], ("Object-Oriented Programming Concepts", "Oracle dev.java", "https://dev.java/learn/oop/")),
    "C++": (["cpp"], ("C++ Language Tutorial", "cplusplus.com", "https://cplusplus.com/doc/tutorial/")),
    # Cloud / DevOps
    "Linux": (["ubuntu", "unix", "linux administration"], ("Linux Journey", "linuxjourney.com", "https://linuxjourney.com/")),
    "Shell Scripting": (["bash", "bash scripting", "shell script"], ("Bash Scripting Tutorial", "linuxconfig.org", "https://linuxconfig.org/bash-scripting-tutorial-for-beginners")),
    "Docker": (["docker compose", "containerization", "containers"], ("Docker Get Started", "Docker", "https://docs.docker.com/get-started/")),
    "Kubernetes": (["k8s", "kubectl", "helm"], ("Kubernetes Basics", "Kubernetes", "https://kubernetes.io/docs/tutorials/kubernetes-basics/")),
    "CI/CD": (["ci cd", "continuous integration", "github actions", "jenkins", "gitlab ci"], ("GitHub Actions Documentation", "GitHub", "https://docs.github.com/en/actions")),
    "Terraform": (["infrastructure as code", "iac"], ("Terraform Tutorials", "HashiCorp", "https://developer.hashicorp.com/terraform/tutorials")),
    "Microsoft Azure": (["azure"], ("Azure Training", "Microsoft Learn", "https://learn.microsoft.com/en-us/training/azure/")),
    "Networking": (["computer networks", "tcp ip", "tcp/ip", "dns", "ccna"], ("Learning Center: Networking", "Cloudflare", "https://www.cloudflare.com/learning/")),
    # Security
    "Network Security": (["firewalls", "information security", "cyber security fundamentals"], ("Introduction to Cybersecurity", "Cisco Networking Academy", "https://www.netacad.com/courses/introduction-to-cybersecurity")),
    "Ethical Hacking": (["penetration testing", "pentesting", "kali linux", "burp suite", "metasploit"], ("TryHackMe Learning Paths", "TryHackMe", "https://tryhackme.com/hacktivities")),
    "Web Security (OWASP)": (["owasp", "owasp top 10", "web application security"], ("OWASP Top Ten", "OWASP", "https://owasp.org/www-project-top-ten/")),
    "SIEM": (["splunk", "security monitoring"], ("Splunk Training", "Splunk", "https://www.splunk.com/en_us/training.html")),
    # Design
    "Figma": (["figma design"], ("Figma Learn", "Figma", "https://help.figma.com/hc/en-us")),
    "Wireframing & Prototyping": (["wireframing", "wireframes", "prototyping", "adobe xd"], ("Wireflows and Prototyping", "Nielsen Norman Group", "https://www.nngroup.com/articles/wireflows/")),
    "User Research": (["usability testing", "ux research", "user interviews", "user personas"], ("User Research Methods", "Nielsen Norman Group", "https://www.nngroup.com/articles/which-ux-research-methods/")),
    # QA
    "Manual Testing": (["software testing", "test cases", "functional testing", "regression testing", "stlc"], ("Software Testing Tutorial", "Guru99", "https://www.guru99.com/software-testing.html")),
    "Selenium": (["selenium webdriver", "automation testing", "test automation"], ("Selenium Documentation", "Selenium", "https://www.selenium.dev/documentation/")),
    "API Testing (Postman)": (["postman", "api testing"], ("Postman Learning Center", "Postman", "https://learning.postman.com/docs/introduction/overview/")),
    "JUnit": (["junit5", "testng", "unit testing"], ("JUnit 5 User Guide", "JUnit", "https://junit.org/junit5/docs/current/user-guide/")),
    # Data engineering
    "Apache Spark": (["spark", "pyspark"], ("Spark Quick Start", "Apache", "https://spark.apache.org/docs/latest/quick-start.html")),
    "Apache Airflow": (["airflow"], ("Airflow Tutorials", "Apache", "https://airflow.apache.org/docs/apache-airflow/stable/tutorial/index.html")),
}

# Learning links for skills that already existed but had no resource.
EXISTING_SKILL_RESOURCES = {
    "React": ("Learn React", "react.dev", "https://react.dev/learn"),
    "AWS Cloud Basics": ("AWS Cloud Practitioner Essentials", "AWS Skill Builder", "https://skillbuilder.aws/"),
    "FastAPI": ("FastAPI Tutorial", "FastAPI", "https://fastapi.tiangolo.com/tutorial/"),
    "Deep Learning": ("Practical Deep Learning", "fast.ai", "https://course.fast.ai/"),
}

# -----------------------------------------------------------------------------
# Career roles: name -> (family, description, [(skill, required_level, weight)])
# -----------------------------------------------------------------------------
NEW_ROLES: Dict[str, Tuple[str, str, List[Tuple[str, int, float]]]] = {
    "Android Developer": ("mobile", "Builds native Android apps with Kotlin/Java, Android SDK and Jetpack libraries.", [
        ("Kotlin", 4, 1.35), ("Android SDK", 4, 1.35), ("Java", 3, 1.2), ("Jetpack Compose", 3, 1.2),
        ("REST APIs", 3, 1.15), ("MVVM Architecture", 3, 1.1), ("XML Layouts", 3, 1.05),
        ("Firebase", 3, 1.05), ("SQLite", 3, 1.0), ("Git", 3, 1.0)]),
    "iOS Developer": ("mobile", "Builds native iPhone and iPad apps with Swift, SwiftUI and Xcode.", [
        ("Swift", 4, 1.35), ("SwiftUI", 3, 1.25), ("Xcode", 3, 1.1), ("REST APIs", 3, 1.1),
        ("Object-Oriented Programming", 3, 1.05), ("Git", 3, 1.0), ("Firebase", 2, 0.9)]),
    "Flutter Developer": ("mobile", "Builds cross-platform Android and iOS apps from one Flutter/Dart codebase.", [
        ("Flutter", 4, 1.35), ("Dart", 4, 1.3), ("REST APIs", 3, 1.1), ("Firebase", 3, 1.1),
        ("Git", 3, 1.0), ("Android SDK", 2, 0.9)]),
    "Frontend Developer": ("web", "Builds responsive, accessible web interfaces with HTML, CSS, JavaScript and React.", [
        ("JavaScript", 4, 1.35), ("React", 3, 1.3), ("HTML", 4, 1.25), ("CSS", 4, 1.25),
        ("TypeScript", 3, 1.1), ("Responsive Web Design", 3, 1.0), ("REST APIs", 3, 1.0), ("Git", 3, 1.0)]),
    "Backend Developer": ("web", "Designs server-side APIs, databases and business logic for web and mobile apps.", [
        ("Node.js", 4, 1.3), ("REST APIs", 4, 1.3), ("Express.js", 3, 1.15), ("SQL", 3, 1.15),
        ("JavaScript", 3, 1.1), ("MongoDB", 3, 1.1), ("Git", 3, 1.0), ("Docker", 2, 0.9)]),
    "Full Stack Developer": ("web", "Builds complete web applications end to end - React frontend, Node.js backend and database.", [
        ("JavaScript", 4, 1.3), ("React", 3, 1.25), ("Node.js", 3, 1.25), ("REST APIs", 3, 1.15),
        ("Express.js", 3, 1.1), ("MongoDB", 3, 1.1), ("SQL", 3, 1.05), ("HTML", 3, 1.0),
        ("CSS", 3, 1.0), ("Git", 3, 1.0)]),
    "Java Developer": ("software", "Develops enterprise applications and microservices with Java and Spring Boot.", [
        ("Java", 4, 1.4), ("Spring Boot", 4, 1.3), ("Object-Oriented Programming", 4, 1.2),
        ("SQL", 3, 1.15), ("REST APIs", 3, 1.15), ("Data Structures & Algorithms", 3, 1.05),
        ("Hibernate / JPA", 3, 1.0), ("Git", 3, 1.0)]),
    "Python Developer": ("software", "Builds backend services, automation and web apps with Python, Django and FastAPI.", [
        ("Python", 4, 1.4), ("Django", 3, 1.25), ("FastAPI", 3, 1.15), ("SQL", 3, 1.15),
        ("REST APIs", 3, 1.15), ("Object-Oriented Programming", 3, 1.05), ("Git", 3, 1.0)]),
    "Software Engineer": ("software", "Designs, codes and tests software using strong programming and problem-solving fundamentals.", [
        ("Data Structures & Algorithms", 4, 1.35), ("Object-Oriented Programming", 4, 1.25),
        ("Problem Solving", 3, 1.1), ("Java", 3, 1.1), ("Python", 3, 1.1), ("SQL", 3, 1.05),
        ("Git", 3, 1.05), ("C++", 3, 1.0), ("REST APIs", 3, 1.0)]),
    "DevOps Engineer": ("infra", "Automates build, test and deployment pipelines and runs cloud infrastructure reliably.", [
        ("Linux", 4, 1.3), ("Docker", 4, 1.3), ("CI/CD", 4, 1.3), ("Kubernetes", 3, 1.25),
        ("AWS Cloud Basics", 3, 1.15), ("Git", 3, 1.1), ("Terraform", 3, 1.05), ("Shell Scripting", 3, 1.05)]),
    "Cloud Engineer": ("infra", "Designs, deploys and manages applications on AWS and Azure cloud platforms.", [
        ("AWS Cloud Basics", 4, 1.4), ("Microsoft Azure", 3, 1.15), ("Linux", 3, 1.15),
        ("Networking", 3, 1.15), ("Terraform", 3, 1.1), ("Docker", 3, 1.05), ("Python", 2, 0.9)]),
    "Cybersecurity Analyst": ("security", "Protects systems and networks by monitoring threats, testing defences and responding to incidents.", [
        ("Network Security", 4, 1.35), ("Networking", 4, 1.25), ("Ethical Hacking", 3, 1.2),
        ("Linux", 3, 1.15), ("Web Security (OWASP)", 3, 1.15), ("SIEM", 3, 1.1),
        ("Python", 2, 0.9), ("Shell Scripting", 2, 0.9)]),
    "UI/UX Designer": ("design", "Researches users and designs intuitive app and web experiences, from wireframes to prototypes.", [
        ("Figma", 4, 1.4), ("Wireframing & Prototyping", 4, 1.3), ("User Research", 3, 1.2),
        ("Responsive Web Design", 3, 1.05), ("Communication", 3, 1.0), ("HTML", 2, 0.9), ("CSS", 2, 0.9)]),
    "QA / Software Tester": ("qa", "Ensures software quality through manual and automated testing of web, mobile and APIs.", [
        ("Manual Testing", 4, 1.3), ("Selenium", 3, 1.25), ("API Testing (Postman)", 3, 1.15),
        ("JUnit", 3, 1.05), ("Java", 3, 1.0), ("SQL", 3, 1.0), ("Problem Solving", 3, 1.0), ("Git", 2, 0.9)]),
    "Data Engineer": ("data", "Builds reliable data pipelines, warehouses and ETL jobs that power analytics and ML.", [
        ("SQL", 4, 1.35), ("Python", 4, 1.3), ("Apache Spark", 3, 1.25), ("ETL & Data Cleaning", 4, 1.25),
        ("Data Modeling", 3, 1.15), ("Apache Airflow", 3, 1.1), ("AWS Cloud Basics", 3, 1.05), ("Git", 3, 1.0)]),
}

# Families of the original roles (no DB column needed)
ROLE_FAMILY: Dict[str, str] = {
    "Data Analyst": "data", "Business Analyst": "data", "BI Analyst": "data",
    "Junior Data Scientist": "data", "Machine Learning Engineer": "data",
    **{name: spec[0] for name, spec in NEW_ROLES.items()},
}

# Families that are close to each other (e.g. a web developer can move into software roles)
NEAR_FAMILIES = {
    frozenset(("web", "software")), frozenset(("mobile", "software")), frozenset(("mobile", "web")),
    frozenset(("infra", "software")), frozenset(("infra", "security")), frozenset(("qa", "software")),
    frozenset(("design", "web")), frozenset(("data", "software")),
}

# -----------------------------------------------------------------------------
# Words in a resume title / objective that name a career role.
# Longer, more specific phrases win; "Software Engineer" is the generic fallback.
# -----------------------------------------------------------------------------
ROLE_TITLE_KEYWORDS: Dict[str, List[str]] = {
    "Android Developer": ["android developer", "android engineer", "android app developer", "android application developer", "android"],
    "iOS Developer": ["ios developer", "ios engineer", "iphone developer", "swift developer", "ios"],
    "Flutter Developer": ["flutter developer", "flutter engineer", "flutter"],
    "Frontend Developer": ["frontend developer", "front end developer", "front-end developer", "frontend engineer",
                           "react developer", "react js developer", "reactjs developer", "angular developer", "ui developer", "web designer"],
    "Backend Developer": ["backend developer", "back end developer", "back-end developer", "backend engineer",
                          "node.js developer", "nodejs developer", "node developer", "api developer"],
    "Full Stack Developer": ["full stack developer", "full-stack developer", "fullstack developer", "full stack",
                             "full-stack", "fullstack", "mern stack", "mern", "mean stack", "web developer"],
    "Java Developer": ["java developer", "java engineer", "spring boot developer", "j2ee developer"],
    "Python Developer": ["python developer", "django developer", "python engineer"],
    "Software Engineer": ["software engineer", "software developer", "sde", "programmer", "application developer"],
    "DevOps Engineer": ["devops engineer", "devops", "site reliability engineer", "sre", "build and release engineer"],
    "Cloud Engineer": ["cloud engineer", "aws engineer", "azure engineer", "cloud architect", "cloud developer"],
    "Cybersecurity Analyst": ["cybersecurity analyst", "cyber security analyst", "security analyst", "soc analyst",
                              "ethical hacker", "penetration tester", "cybersecurity", "cyber security", "information security"],
    "UI/UX Designer": ["ui/ux designer", "ui ux designer", "ux designer", "ui designer", "product designer", "ux/ui", "ui/ux", "ui ux"],
    "QA / Software Tester": ["qa engineer", "software tester", "test engineer", "automation tester", "manual tester",
                             "quality assurance", "sdet", "qa analyst", "tester"],
    "Data Engineer": ["data engineer", "etl developer", "big data engineer", "big data"],
    "Data Analyst": ["data analyst", "data analytics"],
    "Business Analyst": ["business analyst"],
    "BI Analyst": ["bi analyst", "business intelligence", "power bi developer", "bi developer"],
    "Junior Data Scientist": ["data scientist", "data science"],
    "Machine Learning Engineer": ["machine learning engineer", "ml engineer", "ai engineer", "ai/ml engineer"],
}
GENERIC_ROLES = {"Software Engineer"}

# -----------------------------------------------------------------------------
# Jobs: role -> [(title, company, location, mode, type, salary, experience, description, responsibilities)]
# Fictional companies for the demo dataset.
# -----------------------------------------------------------------------------
NEW_JOBS: Dict[str, List[Tuple[str, ...]]] = {
    "Android Developer": [
        ("Junior Android Developer", "AppNest Technologies", "Bangalore, India", "Hybrid", "Full-time", "₹5.0 - ₹8.0 LPA", "0 - 2 Years",
         "Build and maintain consumer Android apps in Kotlin using Jetpack Compose and MVVM.",
         "Develop new app features in Kotlin and Jetpack Compose.\nIntegrate REST APIs with Retrofit.\nFix crashes and improve app performance."),
        ("Android Developer Intern", "MobiCraft Labs", "Pune, India", "On-site", "Internship", "₹20,000 - ₹30,000 / month", "Internship / Fresher",
         "Work with the mobile team on Android features, Firebase integration and UI screens.",
         "Build UI screens with XML layouts and Compose.\nUse Firebase for auth and notifications.\nWrite clean, reviewed code in Git."),
        ("Associate Android Engineer", "PocketPay Fintech", "Hyderabad, India", "Remote", "Full-time", "₹7.0 - ₹11.0 LPA", "1 - 2 Years",
         "Ship secure payment features in a high-traffic Android app with offline support.",
         "Implement features with Kotlin, Coroutines and Room.\nWrite unit tests for view models.\nCollaborate with backend on API contracts."),
    ],
    "iOS Developer": [
        ("Junior iOS Developer", "Orbit Apps Studio", "Bangalore, India", "Hybrid", "Full-time", "₹6.0 - ₹9.0 LPA", "0 - 2 Years",
         "Build polished iPhone apps with Swift and SwiftUI.",
         "Develop SwiftUI screens.\nIntegrate REST APIs.\nPublish builds through Xcode and TestFlight."),
        ("iOS Developer Intern", "Bluefin Digital", "Mumbai, India", "On-site", "Internship", "₹25,000 - ₹35,000 / month", "Internship / Fresher",
         "Assist the iOS team with new features and bug fixes.",
         "Implement UI in SwiftUI and UIKit.\nFix bugs reported by QA.\nLearn app release workflows."),
    ],
    "Flutter Developer": [
        ("Flutter Developer", "CrossWave Solutions", "Ahmedabad, India", "Hybrid", "Full-time", "₹4.5 - ₹7.5 LPA", "0 - 2 Years",
         "Build cross-platform apps for Android and iOS from a single Flutter codebase.",
         "Develop Flutter widgets and screens.\nIntegrate Firebase and REST APIs.\nPublish to Play Store and App Store."),
        ("Flutter Intern", "StartUp Forge", "Remote", "Remote", "Internship", "₹15,000 - ₹25,000 / month", "Internship / Fresher",
         "Help build MVP mobile apps for early-stage startups using Flutter and Dart.",
         "Build reusable Flutter widgets.\nConnect app screens to APIs.\nTest on Android and iOS devices."),
    ],
    "Frontend Developer": [
        ("Frontend Developer (React)", "PixelBridge Software", "Bangalore, India", "Hybrid", "Full-time", "₹5.0 - ₹9.0 LPA", "0 - 2 Years",
         "Build fast, responsive web interfaces in React and TypeScript.",
         "Develop reusable React components.\nMake pages responsive and accessible.\nIntegrate REST APIs."),
        ("Frontend Developer Intern", "WebSprout Media", "Indore, India", "On-site", "Internship", "₹12,000 - ₹20,000 / month", "Internship / Fresher",
         "Turn Figma designs into pixel-perfect HTML, CSS and JavaScript pages.",
         "Convert designs to responsive pages.\nFix cross-browser issues.\nUse Git for version control."),
    ],
    "Backend Developer": [
        ("Junior Backend Developer (Node.js)", "CloudKart Commerce", "Gurugram, India", "Hybrid", "Full-time", "₹6.0 - ₹10.0 LPA", "0 - 2 Years",
         "Build scalable REST APIs for an e-commerce platform using Node.js and Express.",
         "Design REST endpoints.\nModel data in MongoDB and SQL.\nWrite tests and containerise services with Docker."),
        ("Backend Developer Intern", "APIWorks India", "Remote", "Remote", "Internship", "₹15,000 - ₹25,000 / month", "Internship / Fresher",
         "Work on API development, database queries and integrations.",
         "Build Express.js endpoints.\nWrite SQL queries.\nDocument APIs."),
    ],
    "Full Stack Developer": [
        ("Full Stack Developer (MERN)", "NextGen Web Labs", "Pune, India", "Hybrid", "Full-time", "₹6.0 - ₹10.0 LPA", "0 - 2 Years",
         "Build complete web products using MongoDB, Express, React and Node.js.",
         "Develop React frontends and Node.js APIs.\nDesign MongoDB schemas.\nDeploy apps to the cloud."),
        ("Full Stack Developer Intern", "CodeHive Technologies", "Ahmedabad, India", "On-site", "Internship", "₹15,000 - ₹25,000 / month", "Internship / Fresher",
         "Work across the stack on client web applications.",
         "Build features end to end.\nWrite REST APIs and React pages.\nFix bugs across frontend and backend."),
    ],
    "Java Developer": [
        ("Java Developer (Spring Boot)", "Enterprise Core Systems", "Chennai, India", "On-site", "Full-time", "₹5.5 - ₹9.0 LPA", "0 - 2 Years",
         "Develop microservices for banking clients using Java and Spring Boot.",
         "Build Spring Boot REST services.\nWrite JPA/Hibernate data layers.\nWrite JUnit tests."),
        ("Graduate Engineer Trainee - Java", "TechServe Global", "Noida, India", "Hybrid", "Full-time", "₹4.0 - ₹6.0 LPA", "Fresher / Graduate",
         "Graduate programme for Java developers with training on enterprise projects.",
         "Learn enterprise Java stack.\nContribute to client modules.\nPractise DSA and code reviews."),
    ],
    "Python Developer": [
        ("Python Developer (Django)", "ByteLeaf Solutions", "Bangalore, India", "Hybrid", "Full-time", "₹5.0 - ₹8.5 LPA", "0 - 2 Years",
         "Build web backends and automation tools using Python and Django.",
         "Develop Django apps and REST APIs.\nWrite efficient SQL queries.\nAutomate internal workflows."),
        ("Python Developer Intern", "AutoMate AI", "Remote", "Remote", "Internship", "₹15,000 - ₹25,000 / month", "Internship / Fresher",
         "Write Python scripts and FastAPI services for automation products.",
         "Build FastAPI endpoints.\nWrite Python automation scripts.\nUse Git and code reviews."),
    ],
    "Software Engineer": [
        ("Software Engineer - Graduate", "Infinity Code Labs", "Bangalore, India", "Hybrid", "Full-time", "₹7.0 - ₹12.0 LPA", "Fresher / Graduate",
         "Solve real engineering problems with strong DSA and OOP fundamentals.",
         "Design and implement features.\nWrite clean, tested code.\nParticipate in code reviews."),
        ("SDE Intern", "Quantum Leap Software", "Hyderabad, India", "On-site", "Internship", "₹30,000 - ₹45,000 / month", "Internship / Fresher",
         "Six-month software development internship with a pre-placement offer opportunity.",
         "Build features with Java or Python.\nSolve algorithmic problems.\nWork in agile sprints."),
    ],
    "DevOps Engineer": [
        ("Junior DevOps Engineer", "DeployFast Cloud", "Pune, India", "Hybrid", "Full-time", "₹6.0 - ₹10.0 LPA", "0 - 2 Years",
         "Automate CI/CD pipelines and manage containerised workloads on Kubernetes.",
         "Build CI/CD pipelines.\nManage Docker and Kubernetes deployments.\nWrite Terraform and shell scripts."),
        ("DevOps Intern", "InfraOps Labs", "Remote", "Remote", "Internship", "₹15,000 - ₹25,000 / month", "Internship / Fresher",
         "Support the platform team with Linux servers, Docker and pipelines.",
         "Maintain Linux servers.\nContainerise apps with Docker.\nMonitor deployments."),
    ],
    "Cloud Engineer": [
        ("Associate Cloud Engineer", "SkyScale Technologies", "Bangalore, India", "Hybrid", "Full-time", "₹6.0 - ₹10.0 LPA", "0 - 2 Years",
         "Deploy and manage client workloads on AWS and Azure.",
         "Provision cloud resources with Terraform.\nConfigure networking and security groups.\nMonitor cost and uptime."),
        ("Cloud Support Intern", "NimbusNet Services", "Hyderabad, India", "On-site", "Internship", "₹18,000 - ₹28,000 / month", "Internship / Fresher",
         "Help customers troubleshoot cloud and Linux issues.",
         "Troubleshoot AWS services.\nWrite runbooks.\nAutomate checks with Python."),
    ],
    "Cybersecurity Analyst": [
        ("Junior SOC Analyst", "SecureShield Cyber", "Mumbai, India", "On-site", "Full-time", "₹4.5 - ₹7.5 LPA", "0 - 2 Years",
         "Monitor security alerts and respond to incidents in a 24x7 SOC.",
         "Monitor SIEM alerts.\nInvestigate suspicious network activity.\nDocument incidents."),
        ("Cybersecurity Intern", "RedFort Security Labs", "Remote", "Remote", "Internship", "₹15,000 - ₹25,000 / month", "Internship / Fresher",
         "Assist with vulnerability assessments and web application security testing.",
         "Run vulnerability scans.\nTest web apps against OWASP Top 10.\nWrite security reports."),
    ],
    "UI/UX Designer": [
        ("Junior UI/UX Designer", "DesignMint Studio", "Bangalore, India", "Hybrid", "Full-time", "₹4.5 - ₹7.5 LPA", "0 - 2 Years",
         "Design intuitive web and mobile experiences from research to high-fidelity prototypes.",
         "Create wireframes and prototypes in Figma.\nRun usability tests.\nWork with developers on handoff."),
        ("UI/UX Design Intern", "Canvas Creative Labs", "Pune, India", "On-site", "Internship", "₹12,000 - ₹20,000 / month", "Internship / Fresher",
         "Support the design team with UI screens, icons and user research.",
         "Design screens in Figma.\nPrepare user personas.\nMaintain the design system."),
    ],
    "QA / Software Tester": [
        ("QA Engineer (Automation)", "TestRight Solutions", "Chennai, India", "Hybrid", "Full-time", "₹4.5 - ₹7.5 LPA", "0 - 2 Years",
         "Automate web and API tests to keep releases bug-free.",
         "Write Selenium test suites.\nTest APIs with Postman.\nReport and track defects."),
        ("Software Testing Intern", "QualityFirst Labs", "Noida, India", "On-site", "Internship", "₹10,000 - ₹18,000 / month", "Internship / Fresher",
         "Learn manual and automated testing on live client projects.",
         "Write and execute test cases.\nPerform regression testing.\nLog bugs clearly."),
    ],
    "Data Engineer": [
        ("Junior Data Engineer", "StreamLine Data", "Bangalore, India", "Hybrid", "Full-time", "₹7.0 - ₹11.0 LPA", "0 - 2 Years",
         "Build batch and streaming data pipelines with Python, SQL and Spark.",
         "Develop ETL pipelines.\nSchedule jobs with Airflow.\nModel data in the warehouse."),
    ],
}

RESOURCE_PREFIX = "careeriq-catalog"  # marks resources added by this seed


def _snake(name: str) -> str:
    return re.sub(r"[^a-z0-9]+", "_", name.lower()).strip("_")


def seed_career_catalog(db: Session) -> dict:
    """Adds missing skills, aliases, roles, role skills, jobs and learning resources. Safe to run repeatedly."""
    added = {"skills": 0, "aliases": 0, "roles": 0, "jobs": 0, "resources": 0}

    # --- Skills ---
    skills_by_name = {s.skill_name.lower(): s for s in db.query(Skill).all()}
    skills_by_norm = {(s.normalized_name or "").lower(): s for s in skills_by_name.values()}
    for name in NEW_SKILLS:
        if name.lower() in skills_by_name or _snake(name) in skills_by_norm:
            continue
        s = Skill(skill_name=name, normalized_name=_snake(name), active_status=1)
        db.add(s)
        db.flush()
        skills_by_name[name.lower()] = s
        skills_by_norm[_snake(name)] = s
        added["skills"] += 1

    def skill(name: str) -> Skill:
        return skills_by_name.get(name.lower()) or skills_by_norm.get(_snake(name))

    # --- Aliases (alias names are unique across all skills) ---
    taken = {a.alias_name.lower() for a in db.query(SkillAlias).all()} | set(skills_by_name)
    for name, (aliases, _res) in NEW_SKILLS.items():
        sk = skill(name)
        for alias in aliases:
            if alias.lower() in taken:
                continue
            db.add(SkillAlias(skill_id=sk.skill_id, alias_name=alias, normalized_alias=_snake(alias)))
            taken.add(alias.lower())
            added["aliases"] += 1

    # --- Learning resources ---
    linked = {(l.skill_id) for l in db.query(LearningResourceSkill).all()}
    wanted = {name: spec[1] for name, spec in NEW_SKILLS.items() if spec[1]}
    wanted.update(EXISTING_SKILL_RESOURCES)
    for name, (title, provider, url) in wanted.items():
        sk = skill(name)
        if not sk or sk.skill_id in linked:
            continue
        res = LearningResource(title=title, provider=provider, resource_type="course", url=url, is_free=1, active_status=1)
        db.add(res)
        db.flush()
        db.add(LearningResourceSkill(resource_id=res.resource_id, skill_id=sk.skill_id))
        linked.add(sk.skill_id)
        added["resources"] += 1

    # --- Career roles + role skills ---
    roles_by_name = {r.role_name.lower(): r for r in db.query(CareerRole).all()}
    for role_name, (_family, desc, role_skills) in NEW_ROLES.items():
        role = roles_by_name.get(role_name.lower())
        if not role:
            role = CareerRole(role_name=role_name, description=desc, active_status=1)
            db.add(role)
            db.flush()
            roles_by_name[role_name.lower()] = role
            added["roles"] += 1
            for sk_name, level, weight in role_skills:
                db.add(CareerRoleSkill(career_role_id=role.career_role_id, skill_id=skill(sk_name).skill_id,
                                       required_level=level, importance_weight=weight,
                                       mandatory_flag=1 if weight >= 1.25 else 0))

    # --- Jobs + job skills ---
    existing_jobs = {(j.job_title.lower(), j.company_name.lower()) for j in db.query(Job).all()}
    today = date.today()
    for role_name, jobs in NEW_JOBS.items():
        role = roles_by_name[role_name.lower()]
        role_skills = NEW_ROLES[role_name][2]
        for i, (title, company, location, mode, jtype, salary, exp, desc, resp) in enumerate(jobs):
            if (title.lower(), company.lower()) in existing_jobs:
                continue
            job = Job(career_role_id=role.career_role_id, job_title=title, company_name=company, location=location,
                      work_mode=mode, job_type=jtype, salary_range=salary, experience_requirement=exp,
                      description=desc, responsibilities=resp, posted_date=today - timedelta(days=2 + i),
                      due_date=today + timedelta(days=24 + 3 * i), is_demo_data=1, source="MCA Curated Dataset 2026")
            db.add(job)
            db.flush()
            # Interns need a lower level than full-time hires
            for sk_name, level, weight in role_skills[:6]:
                req = max(2, level - 1) if jtype == "Internship" else min(level, 3)
                db.add(JobSkill(job_id=job.job_id, skill_id=skill(sk_name).skill_id, required_level=req,
                                importance_weight=weight, mandatory_flag=1 if weight >= 1.25 else 0))
            existing_jobs.add((title.lower(), company.lower()))
            added["jobs"] += 1

    db.commit()
    return added


# -----------------------------------------------------------------------------
# Resume role detection
# -----------------------------------------------------------------------------
def _phrase_re(phrase: str):
    return re.compile(r"(?<![\w/])" + re.escape(phrase) + r"(?![\w/])")


_ROLE_PATTERNS = {role: [(kw, _phrase_re(kw)) for kw in kws] for role, kws in ROLE_TITLE_KEYWORDS.items()}


def detect_role_name(text: str) -> Optional[str]:
    """
    Returns the career role named by the resume, e.g. "Android Developer".
    1. A role named in the header / title (first lines) wins - most specific phrase first.
    2. Otherwise the role whose keywords appear most often in the whole resume (at least twice).
    """
    if not text:
        return None
    lines = [re.sub(r"\s+", " ", l).strip() for l in text.splitlines() if l.strip()]
    header = " ".join(lines[:8]).lower()

    best, best_score = None, 0
    for role, patterns in _ROLE_PATTERNS.items():
        for kw, pat in patterns:
            if pat.search(header):
                score = 100 + len(kw) - (50 if role in GENERIC_ROLES else 0)
                if score > best_score:
                    best, best_score = role, score
                break
    if best:
        return best

    body = " ".join(lines).lower()
    counts = {}
    for role, patterns in _ROLE_PATTERNS.items():
        hits = sum(len(pat.findall(body)) for _kw, pat in patterns)
        if hits:
            counts[role] = hits - (1 if role in GENERIC_ROLES else 0)
    if counts:
        role, hits = max(counts.items(), key=lambda kv: kv[1])
        if hits >= 2:
            return role
    return None


def title_fit(role_name: str, resume_role_name: Optional[str]) -> float:
    """How well a role fits the resume's own job title: 100 same role, 60 same family, 30 near family, else 0."""
    if not resume_role_name:
        return 0.0
    if role_name == resume_role_name:
        return 100.0
    fam, resume_fam = ROLE_FAMILY.get(role_name), ROLE_FAMILY.get(resume_role_name)
    if fam and fam == resume_fam:
        return 60.0
    if fam and resume_fam and frozenset((fam, resume_fam)) in NEAR_FAMILIES:
        return 30.0
    return 0.0
