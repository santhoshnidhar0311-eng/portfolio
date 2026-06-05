/**
 * S. Santhosh - Personal Portfolio Data Configuration
 * 
 * Instructions:
 * - You can edit any of the values inside this file to customize the content of your website.
 * - For files (like resume or certificates), place your actual files inside the "documents/" folder,
 *   and update the file paths here (e.g., "documents/my_resume.pdf").
 * - If you want to add new projects, skills, or certificates, simply follow the existing format
 *   and add new items to the arrays.
 */

const PORTFOLIO_DATA = {
    // ----------------------------------------------------
    // 1. PROFILE INFORMATION
    // ----------------------------------------------------
    profile: {
        name: "S. Santhosh",
        title: "B.Tech Computer Science Engineering Student (AI & ML)",
        years: "2024 - 2028", // Graduation Batch
        collegeName: "SRM Institute of Science and Technology, Trichy",
        cgpa: "9.0 / 10.0", // Actual CGPA from resume
        email: "santhoshnidhar0311@gmail.com", // Actual email
        phone: "+91 81227 95505", // Actual phone number
        linkedin: "https://linkedin.com/in/santhosh-s-santhosh03111", // Actual LinkedIn URL
        github: "https://github.com/santhoshnidhar0311-eng", // Actual GitHub URL
        resumeUrl: "resume.html", // Path to your resume PDF or HTML page
        taglines: [
            "AI & ML Specialist",
            "Software Developer",
            "Python & Java Programmer",
            "Full Stack Web Developer"
        ],
        about: "Dedicated Computer Science Engineering student specializing in Artificial Intelligence and Machine Learning with a CGPA of 9.0. Proficient in Java, Python, HTML, CSS, Flask, and MySQL with hands-on experience building AI-driven applications including a triage classification system and a portfolio management tool. Proven track record in competitive hackathons, including winning a 12-hour hackathon and ranking in the top 10 in an AI healthcare challenge. Seeking opportunities to apply AI/ML expertise in real-world software development."
    },

    // ----------------------------------------------------
    // 2. TECHNICAL SKILLS
    // ----------------------------------------------------
    skills: [
        {
            category: "Programming Languages",
            items: [
                { name: "Python", iconClass: "fa-brands fa-python", color: "#3776ab" },
                { name: "Java", iconClass: "fa-brands fa-java", color: "#f89820" }
            ]
        },
        {
            category: "Web & Databases",
            items: [
                { name: "HTML5", iconClass: "fa-brands fa-html5", color: "#e34c26" },
                { name: "CSS3", iconClass: "fa-brands fa-css3-alt", color: "#264de4" },
                { name: "Flask", iconClass: "fa-solid fa-fire", color: "#ffffff" },
                { name: "MySQL", iconClass: "fa-solid fa-database", color: "#00758f" }
            ]
        },
        {
            category: "Specialized Domains",
            items: [
                { name: "Artificial Intelligence", iconClass: "fa-solid fa-brain", color: "#00f2fe" },
                { name: "Machine Learning", iconClass: "fa-solid fa-robot", color: "#a100ff" }
            ]
        },
        {
            category: "Tools & Platforms",
            items: [
                { name: "Git", iconClass: "fa-brands fa-git-alt", color: "#f1502f" },
                { name: "GitHub", iconClass: "fa-brands fa-github", color: "#ffffff" }
            ]
        }
    ],

    // ----------------------------------------------------
    // 3. PROJECTS
    // ----------------------------------------------------
    projects: [
        {
            title: "AI-Based Triage System",
            description: "Designed and developed an AI-driven triage system to classify and prioritize emergency department patients based on symptom severity and clinical indicators.",
            features: [
                "Classifies and prioritizes emergency patients dynamically.",
                "Applies machine learning algorithms to automate patient risk assessment.",
                "Reduces manual triage time and improves diagnosis accuracy."
            ],
            technologies: ["Python", "Machine Learning", "AI"],
            githubLink: "https://github.com/santhoshnidhar0311-eng", // Replace with actual repository link
            liveLink: ""
        },
        {
            title: "Portfolio Management System",
            description: "Built a complete stock portfolio tracking web application featuring user-friendly dashboards for tracking and analyzing investments.",
            features: [
                "Built user-friendly dashboards to view and manage stock portfolios.",
                "Integrated MySQL database for storing and retrieving user investment data.",
                "Developed front-end layouts with HTML/CSS and back-end APIs with Python Flask."
            ],
            technologies: ["Flask", "MySQL", "Python", "HTML/CSS"],
            githubLink: "https://github.com/santhoshnidhar0311-eng", // Replace with actual repository link
            liveLink: ""
        },
        {
            title: "Simulation of Traffic Control",
            description: "Developed a traffic control system simulation to model and manage vehicle flow at complex intersections using rule-based automation.",
            features: [
                "Models and manages vehicle flow using automated signal control logic.",
                "Optimizes traffic throughput and reduces wait times at intersections.",
                "Utilizes Python rule-based automation systems to simulate vehicle logic."
            ],
            technologies: ["Python", "Simulation", "Automation"],
            githubLink: "https://github.com/santhoshnidhar0311-eng", // Replace with actual repository link
            liveLink: ""
        }
    ],

    // ----------------------------------------------------
    // 4. EDUCATION TIMELINE
    // ----------------------------------------------------
    education: [
        {
            degree: "Bachelor of Technology - Computer Science Engineering (AI & ML)",
            institution: "SRM Institute of Science and Technology, Trichy",
            duration: "Aug 2024 - May 2028",
            scoreType: "CGPA",
            score: "9.0 / 10.0", // Actual CGPA from resume
            description: "Specializing in Artificial Intelligence and Machine Learning. Hands-on learning in Machine Learning algorithms, Data Structures, OOPs, Database Management systems, and Web frameworks."
        }
    ],

    // ----------------------------------------------------
    // 5. CERTIFICATIONS
    // ----------------------------------------------------
    certifications: [
        {
            title: "Introduction to AI",
            organization: "Google (via Coursera)",
            date: "Earned: Mar 8, 2026",
            fileUrl: "https://coursera.org/verify/R1HZZX1HVOYE", // Live Coursera verify link!
            description: "Authorized by Google and offered through Coursera. Explores fundamental concepts of Artificial Intelligence, neural networks, machine learning models, and their applications."
        },
        {
            title: "Ethical Hacking Virtual Internship",
            organization: "EduSkills Academy / AICTE",
            date: "Earned: July - Sept 2025",
            fileUrl: "documents/certificate-ethical-hacking.jpg", // Local image path
            description: "Completed a 10-week Virtual Internship in Ethical Hacking supported by EduSkills and the AICTE National Internship Portal."
        },
        {
            title: "Python Programming Virtual Internship",
            organization: "CodSoft",
            date: "Earned: Jan 8, 2026",
            fileUrl: "documents/certificate-codsoft-python.png", // Local image path
            description: "Completed a 4-week virtual internship program in Python Programming, building software solutions and database integrations with positive feedback."
        }
    ],

    // ----------------------------------------------------
    // 6. ACHIEVEMENTS
    // ----------------------------------------------------
    achievements: [
        {
            title: "Hackathon Winner",
            organization: "Coimbatore Institute of Technology",
            date: "2025",
            description: "Won a 12-hour coding hackathon by building a high-performing prototype system under strict constraints."
        },
        {
            title: "Top 10 Finish",
            organization: "National-level Hackathon",
            date: "2025",
            description: "Ranked in the top 10 at a national-level hackathon focused on AI in Healthcare."
        },
        {
            title: "Smart India Hackathon Participant",
            organization: "Ministry of Education, Govt. of India",
            date: "2025",
            description: "Selected to participate in the prestigious national Smart India Hackathon (SIH) rounds representing the institution."
        }
    ]
};
