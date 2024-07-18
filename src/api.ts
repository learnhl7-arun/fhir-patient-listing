import axios from 'axios'

export const fhirBaseUrl = import.meta.env.VITE_BASE_URL;

export const fhirApi = axios.create({baseURL:fhirBaseUrl,headers:{
    //https://hapifhir.io/hapi-fhir/docs/server_jpa/configuration.html
    'Cache-Control':'no-cache'
}})