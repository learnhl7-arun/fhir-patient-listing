import axios from "axios";

// export const fhirBaseUrl = "https://hapi.fhir.org/baseR4";
export const fhirBaseUrl = import.meta.env.VITE_BASE_URL;

export const fhirApi = axios.create({ baseURL: fhirBaseUrl });
