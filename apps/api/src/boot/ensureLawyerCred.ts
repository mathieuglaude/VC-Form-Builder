import { ensureLawyerCred } from "../../ensureLawyerCred";

// Boot sequence: Ensure BC Lawyer Credential exists on startup
ensureLawyerCred().catch(console.error);