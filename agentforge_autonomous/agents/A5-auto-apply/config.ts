/**
 * A5 Auto-Apply CLI Config
 *
 * Single source of truth for all A5 pipeline constants used by CLI scripts.
 * All values are literals -- no magic strings or numbers in agent code.
 *
 * Marcus: update vmockSelectors after inspecting VMock DOM live.
 * Marcus: update resumeVaultPath to your actual resumes folder.
 */
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");

const CONFIG = {
  /** Gmail search query for job opportunity emails (last 7 days). */
  gmailQuery: "subject:(job OR position OR role OR opening) newer_than:7d",

  /** Absolute path to folder containing .docx resume variants. */
  resumeVaultPath: "C:/Users/daley/Resumes",

  /** VMock login URL. */
  vmockUrl: "https://www.vmock.com",

  /** Path to saved Playwright browser session (created by setup-vmock-auth.mjs). */
  authStatePath: join(ROOT, "agents/A5-auto-apply/vmock-auth.json"),

  /** Directory for per-job VMock screenshots and output files. */
  screenshotDir: join(ROOT, "agents/A5-auto-apply/jobs"),

  /** Directory for per-job output files (JD text, resume versions, scores). */
  jobsDir: join(ROOT, "agents/A5-auto-apply/jobs"),

  /** Directory for CommonCrawl corpus and vocabulary files. */
  corpusDir: join(ROOT, "agents/A5-auto-apply/corpus"),

  /** Hugging Face Inference API base URL. */
  hfApiBase: "https://api-inference.huggingface.co/models",

  /** Model for resume/JD semantic similarity (cosine). */
  hfMatchModel: "sentence-transformers/all-MiniLM-L6-v2",

  /** Model for JD keyword extraction. */
  hfKeywordModel: "yanekyuk/bert-uncased-keyword-extractor",

  /** Model for NER on job email text (company, title, location). */
  hfNerModel: "dslim/bert-base-NER",

  /** Minimum cosine similarity to proceed; below this flags for manual review. */
  minMatchScore: 0.65,

  /** VMock score required to emit resume.approved and stop iterating. */
  vmockPassThreshold: 75,

  /** Maximum VMock upload iterations before emitting resume.failed. */
  maxIterations: 3,

  /**
   * VMock DOM selectors -- PLACEHOLDER values.
   * Marcus must replace these after logging into VMock and inspecting the DOM.
   */
  vmockSelectors: {
    fileInput: "input[type=file]",
    jdTextarea: "textarea[placeholder*='description' i]",
    submitButton: "button[type=submit]",
    scoreElement: "[data-testid='score-value']",
    feedbackItems: "[data-testid='feedback-item']",
  },
} as const;

export default CONFIG;
export type A5Config = typeof CONFIG;
