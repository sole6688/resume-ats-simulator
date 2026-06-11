# Resume ATS Simulator

A privacy-friendly, front-end resume screening simulator for career consultants. It compares resume content with a job description, visualizes likely keyword gaps, and generates practical coaching notes.

> This is an educational coaching tool, not a replacement for a real Applicant Tracking System. Different employers use different screening processes and scoring rules.

## Features

- Paste resume and job-description text directly
- Import text-based PDFs in the browser
- Recognize text in resume photos or scanned documents with browser-based OCR
- Show a High, Medium, or Low screening-risk profile as a proportional pie chart
- Use an internal weighted model based on JD keywords, skill coverage, and target-role fit without displaying a numeric score
- Prioritize Top Missing Skills, Top Missing Keywords, and Top Resume Risks
- Show matched and missing keywords
- Group evidence into programming languages, tools/platforms, technical skills, domain skills, and soft skills
- Classify screening risk and generate consultant notes
- Auto-detect or manually select one of six built-in role templates
- Print the analysis as a clean report
- No account, backend, database, or paid API

## Using the Simulator

1. Open `index.html` in a browser or visit the deployed GitHub Pages URL.
2. Paste resume text, or import a PDF/image.
3. Paste the complete job description.
4. Select a target role or leave the selector on **Auto-detect best match**.
5. Click **Analyze Match**.
6. Review the risk profile, top missing skills, top missing keywords, resume risks, and consultant notes.

PDF parsing and image OCR happen locally in the browser. The document is not uploaded. The project loads PDF.js, Tesseract.js, and web fonts from public CDNs, so those features require an internet connection on first use. Text-based PDFs produce the best results; image quality affects OCR accuracy.

## Run Locally

Because this is a static site, you can open `index.html` directly. For the most reliable PDF worker behavior, serve the folder locally:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Deploy to GitHub Pages

1. Create a new GitHub repository.
2. Add `index.html`, `style.css`, `script.js`, and `README.md` to the repository root.
3. Push the files to the `main` branch.
4. In the repository, open **Settings → Pages**.
5. Under **Build and deployment**, select **Deploy from a branch**.
6. Choose the `main` branch and `/ (root)` folder, then save.
7. GitHub will publish the site at `https://<username>.github.io/<repository-name>/`.

## Built-in Role Templates

- SDE / Software Engineer
- Data Analyst
- Data Scientist
- RTL / FPGA Engineer
- Design Verification Engineer
- Embedded / Firmware Engineer

## Future Extensions

- Multi-language OCR and Chinese resume support
- Resume section detection and formatting-risk checks
- Exportable PDF consultant reports
- Custom organization keyword libraries
- Side-by-side resume revision comparison
- Weighted must-have versus nice-to-have JD requirements
- Local-only AI suggestions using an in-browser model

## Why This Tool Exists

The simulator helps career consultants explain why target-role customization matters. A high application count with few interviews may reflect weak keyword and evidence alignment before a recruiter ever reviews the resume. The goal is to make that screening stage easier to understand and improve.
