# Modern & Professional Personal Portfolio Website

A premium, Antigravity-inspired personal portfolio website designed for **S. Santhosh**, a B.Tech Computer Science Engineering student (Batch **2024 - 2028**).

This website features a modern deep-space dark theme, responsive layouts for mobile and desktop, glassmorphism cards, interactive particle backgrounds, dynamic typing effects, scroll reveal controls, and an easily customizable data structure.

---

## 📁 File Structure

The project has the following layout:
```text
Personal portfolio/
│
├── index.html          # Main web structure & SEO tags
├── style.css           # Styling, colors, transitions, and gravity animations
├── script.js           # Particle animations, typing carousels, and render logic
├── portfolio-data.js   # EASILY EDITABLE file containing all your text/data 
│
└── documents/          # Place your original PDFs and images here
    ├── resume.pdf          # Place your actual resume PDF here
    ├── certificate-dsa.pdf # Place your actual DSA certificate here
    └── certificate-web.pdf # Place your actual Web Dev certificate here
```

---

## 🛠️ How to Customize Your Portfolio

You **do not need** to edit complex HTML code to change your details. All the text content of your website is centralized in **`portfolio-data.js`**.

### 1. Update Personal Data
Open [portfolio-data.js](file:///c:/Users/deepa/OneDrive/Desktop/summa/Personal portfolio/portfolio-data.js) in your text editor (like VS Code) and update the values inside the `PORTFOLIO_DATA` object:
*   **Name & College**: Replace `"Your College / University Name"` with your actual college.
*   **CGPA**: Change `"9.0/ 10.0"` to your current CGPA.
*   **Contact Info**: Edit email, phone number, and social profiles (LinkedIn and GitHub).
*   **About Me**: Customize the biography text to match your goals.
*   **Skills**: Add or remove items from the skill badges. Follow the existing template if adding new skills.
*   **Projects & Achievements**: Add description bullets and change titles as you build new projects!

### 2. Add Original Resume & Certificates
To make your real documents public:
1.  Save your resume as a PDF and name it `resume.pdf`. Move it into the `documents/` folder, replacing the placeholder file.
2.  Save your certification credentials as PDFs or image files (e.g., `certificate-dsa.pdf`, `certificate-web.pdf`) and place them inside the `documents/` folder.
3.  If you change the filenames, remember to open `portfolio-data.js` and update the matching paths (e.g., `fileUrl: "documents/new-certificate.png"`).

---

## 🌐 How to Make Your Portfolio Public (Free Hosting)

To share this website with recruiters and friends, you can host it for free using **GitHub Pages**.

### Step 1: Create a GitHub Repository
1.  Log in to [GitHub](https://github.com/) (create an account if you don't have one).
2.  Click on the green **New** button to create a repository.
3.  Name your repository: `portfolio` (or anything you like).
4.  Set the repository to **Public** so everyone can see it.
5.  Leave "Initialize this repository with a README" unchecked, then click **Create repository**.

### Step 2: Upload Your Files
1.  On the quick setup page, click on **uploading an existing file**.
2.  Drag and drop **all files and folders** from your local `Personal portfolio` directory (including `index.html`, `style.css`, `script.js`, `portfolio-data.js`, and the `documents/` folder).
3.  Wait for the upload to complete, scroll down, and click **Commit changes**.

### Step 3: Enable GitHub Pages
1.  In your GitHub repository page, click on **Settings** (gear icon in the top navigation).
2.  In the left sidebar, under the "Code and automation" section, click on **Pages**.
3.  Under **Build and deployment** -> **Branch**, click the dropdown that says `None` and change it to `main` (or `master`).
4.  Leave the folder path as `/ (root)` and click **Save**.
5.  Wait about 1 to 2 minutes. Refresh the page, and you will see a notice at the top:
    > **Your site is live at** `https://<your-username>.github.io/portfolio/`

*Copy that link and add it to your LinkedIn profile, resume, and GitHub bio!*

---

## ⚡ Alternative Hosting Options (Drag-and-Drop)
If you do not want to use Git/GitHub, you can publish your site in seconds using these free platforms:
*   **Netlify Drop**: Go to [Netlify Drop](https://app.netlify.com/drop), drag your entire folder, and drop it. It will build and give you a live link immediately.
*   **Vercel**: You can install the Vercel CLI or connect Vercel to your GitHub account to deploy static sites automatically.
