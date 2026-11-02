export interface Project {
  slug: string;
  title: string;
  year: string;
  tagline: string;
  partner?: string;
  partnerUrl?: string;
  /** Link to the live project or repository; the button is hidden when omitted */
  href?: string;
  info: string | null;
  /** Preview image for the project card */
  image?: string;
  /** Preview video; a text poster is shown when omitted */
  video?: string;
  description: string[];
  collaboration?: string;
  stack: string[];
  stackNote?: string;
}

export interface ExperienceItem {
  role: string;
  company: string;
  location: string;
  period: string;
  current?: boolean;
  highlights: string[];
}

export interface PortfolioData {
  name: string;
  role: string;
  statement: string;
  location: string;
  workPhilosophy: string;
  email: string;
  linkedin: string;
  linkedinUrl: string;
  /** File served from /public; the download button points here */
  resumeUrl: string;
  copyrightYear: string;
  experience: ExperienceItem[];
  projects: Project[];
}

export const portfolioData: PortfolioData = {
  name: "Mohammed Rashil",
  role: "AI Developer",
  statement: "I build intelligent AI solutions, transform data into actionable insights, and create modern web experiences. AI development, machine learning, data analytics, and web development — combining intelligence, performance, and design to solve real-world problems.",
  location: "Based in India",
  workPhilosophy: "I turn data into insights, ideas into intelligent solutions, and concepts into captivating digital experiences. From AI and machine learning to data analytics and web development — I build technology that thinks smarter, works better, and makes an impact.",
  email: "rashilk724@gmail.com",
  linkedin: "LinkedIn",
  linkedinUrl: "https://www.linkedin.com/in/mohammedrashil/",
  resumeUrl: "/Mohammed-Rashil-Resume.pdf",
  copyrightYear: "2026",
  experience: [
    {
      role: "Data Analyst & Programmer",
      company: "Web-3 Technologies Pvt Ltd",
      location: "Wayanad, Kerala",
      period: "Feb 2026 – Present",
      current: true,
      highlights: [
        "Built end-to-end analytics pipelines with Python and PostgreSQL, delivering dashboards that speed up management decisions.",
        "Developed a blockchain transaction monitoring system for a Web3 gaming platform on the Polygon Amoy testnet.",
        "Designed and deployed the Genius Reward System, a decentralised student incentive platform using Solidity, ethers.js, React and FastAPI.",
        "Created FastAPI services and React frontends that automated manual data-processing work."
      ]
    },
    {
      role: "Data Science Intern",
      company: "Rubixe AI",
      location: "Bengaluru",
      period: "2025 – 2026",
      highlights: [
        "Ran EDA and statistical analysis on real-world datasets for client-facing deliverables.",
        "Built end-to-end ML pipelines, from feature engineering and tuning to evaluation, with Scikit-learn classification and regression models.",
        "Trained image-classification models in TensorFlow and PyTorch using CNNs and transfer learning."
      ]
    }
  ],
  projects: [
    {
      slug: "multimodal-rag",
      title: "Multimodal RAG",
      year: "",
      info: "Generative AI",
      image: "/projects/multimodal-rag.jpg",
      tagline: "Ask questions of your documents and get grounded answers.",
      description: [
        "A Retrieval-Augmented Generation pipeline that turns unstructured documents into searchable knowledge: OCR extraction, semantic chunking and vector embeddings feed precise, natural-language Q&A.",
        "LLM inference is orchestrated with LangChain and FastEmbed vector search for context-aware, hallucination-reduced answers, delivered through a Streamlit app that lets non-technical users query complex documents instantly."
      ],
      stack: ["Python", "LangChain", "FastEmbed", "Vector Search", "OCR", "Streamlit"]
    },
    {
      slug: "bank-market-analysis",
      title: "Bank Market Analysis",
      year: "",
      info: "Predictive Analytics",
      image: "/projects/bank-market-analysis.jpg",
      tagline: "Finding what drives customers to subscribe.",
      description: [
        "Analysis of a 45,000+ row bank marketing dataset to uncover the behavioural drivers of customer subscription, using EDA and feature engineering to surface high-impact predictive signals.",
        "Logistic Regression, Random Forest and Gradient Boosting were compared, reaching about 85% prediction accuracy, and the findings were delivered as executive-ready Power BI dashboards with a strategic recommendation report."
      ],
      stack: ["Python", "Pandas", "Scikit-learn", "Seaborn", "Power BI"]
    },
    {
      slug: "skin-disorder-detection",
      title: "Skin Disorder Detection",
      year: "",
      info: "Machine Learning",
      image: "/projects/skin-disorder-detection.jpg",
      tagline: "A clinical decision-support tool for skin disorders.",
      description: [
        "A machine learning classifier that predicts skin disorders from patient features, covering the full pipeline from data cleaning and feature selection to model evaluation and deployment.",
        "Deployed as a Streamlit interface that gives healthcare professionals interpretable, feature-based predictions."
      ],
      stack: ["Python", "Scikit-learn", "Pandas", "Streamlit"]
    }
  ]
};


