<script>
  import { navigate } from "svelte-routing";
  import logo from "../assets/logo.png";
  import { patientStore } from "../stores/patientStore";
  import { currentPath } from "../stores/pathStore";
  import { get } from 'svelte/store';
  import { onMount } from 'svelte';
  import { CogOutline } from "flowbite-svelte-icons";

  import hypertension from '../assets/icons/hypertension.svg';
  import hypertension_active from '../assets/icons/hypertension_active.svg'
  import loinc from '../assets/icons/loinc.svg';
  import loinc_active from '../assets/icons/loinc_active.svg'
  import medicine_bottle from '../assets/icons/medicine_bottle.svg'
  import medicine_bottle_active from '../assets/icons/medicine_bottle_active.svg'
  import biochemistryLab from '../assets/icons/biochemistry_laboratory.svg';
  import doctor from '../assets/icons/doctor.svg';
  import medicalBook from '../assets/icons/book.svg';
  import lab_request from '../assets/icons/lab_request.svg'
  import lab_request_active from '../assets/icons/lab_request_active.svg'

  let patientId = "";
  // Variable for navigation
  let currentLocation = window.location.pathname;

  currentPath.subscribe(value => {
    currentLocation = value;
  });
  patientStore.subscribe(value => {
    patientId = value.id;
  });

  // Function to navigate to a new path and update currentLocation
  // @ts-ignore
  function navigateTo(path) {
    navigate(path);
  
    currentPath.set(path);
  }

  // @ts-ignore
  function goToHome(event) {
    event.preventDefault();
    patientStore.set({ id: "", name: "", birthDate: "", gender: "" });
    // navigateTo("/patientList");
    window.location.href = "/patientList";
  }

  // Function to check if the current navlink is active
  // @ts-ignore
  function isActive(path) {
    return currentLocation.startsWith(path);
  }

  // Ensure patientId is fetched from patientStore on reload
  // @ts-ignore
  $: patientId = get(patientStore).id;

  const isPatientSectionActive = () =>   window.location.pathname.startsWith("/patient/");
  const isMasterSectionActive = () =>  window.location.pathname.startsWith("/master/");
  const isConfigSectionActive = () => window.location.pathname.startsWith("/patientList");



  onMount(() => {
    const storedPatient = get(patientStore);
    if (storedPatient.id) {
      patientStore.set(storedPatient);
    }
  });
</script>

<aside class="bg-sidebar-bg w-full h-full p-4 text-gray-700 rounded-l-xl">
  <nav>
    <ul>
      <li class="my-4">
        <a
          href="/patientList"
          class="flex items-center {isActive('/patientList') ? 'active-link' : ''}"
          on:click={goToHome}
        >
          <img src={logo} alt="FHIR" height="175" />
        </a>
      </li>

      {#if isPatientSectionActive()}
      <div class="my-6">
        <!-- <h2 class="font-bold text-lg">Patient</h2> -->
        <ul class="my-2">
          <li class="mb-4 ml-2">
            <a href={`/patient/${patientId}/vitals`} class="flex items-center {isActive(`/patient/${patientId}/vitals`) ? 'active-link' : ''}">
              <img src={isActive(`/patient/${patientId}/vitals`) ? hypertension_active : hypertension} alt="Vitals" class="w-6 h-6" />
              <span class="ml-2">Vitals</span>
            </a>
          </li>
          <li class="mb-4 ml-2">
            <a href={`/patient/${patientId}/labRequest`} class="flex items-center {isActive(`/patient/${patientId}/labRequest`) ? 'active-link' : ''}">
              <img src={isActive(`/patient/${patientId}/labRequest`) ? lab_request_active : lab_request} alt="Lab Request" class="w-6 h-6" />
              <span class="ml-2">Lab Request</span>
            </a>
          </li>
          <li class="mb-4 ml-2">
            <a href={`/patient/${patientId}/observationList`} class="flex items-center {isActive(`/patient/${patientId}/observationList`) ? 'active-link' : ''}">
              <img src={isActive(`/patient/${patientId}/observationList`) ? loinc_active : loinc} alt="Observation List" class="w-6 h-6" />
              <span class="ml-2">Observation</span>
            </a>
          </li>
          <li class="my-4 ml-2">
            <a href={`/patient/${patientId}/medOrders`} class="flex items-center {isActive(`/patient/${patientId}/medOrders`) ? 'active-link' : ''}">
              <img src={isActive(`/patient/${patientId}/medOrders`) ? medicine_bottle_active: medicine_bottle} alt="Med Orders" class="w-6 h-6" />
              <span class="ml-2">Med Orders</span>
            </a>
          </li>
        </ul>
      </div>
    {/if}
    
    {#if isMasterSectionActive()}
      <div class="ml-4">
        <h2 class="font-bold text-lg">Master</h2>
        <ul class="my-2">
          <li class="mb-4 ml-2">
            <a href="/master/labServices" class="flex items-center {isActive('/master/labServices') ? 'active-link' : ''}">
              <img src={biochemistryLab} alt="Lab Services" class="w-6 h-6" />
              <span class="ml-2">Lab Services</span>
            </a>
          </li>
          <li class="mb-4 ml-2">
            <a href="/master/doctor" class="flex items-center {isActive('/master/doctor') ? 'active-link' : ''}">
              <img src={doctor} alt="Doctor" class="w-6 h-6" />
              <span class="ml-2">Doctor</span>
            </a>
          </li>
          <li class="mb-4 ml-2">
            <a href="/master/medicationsList" class="flex items-center {isActive('/master/medicationsList') ? 'active-link' : ''}">
              <img src={medicalBook} alt="Medications List" class="w-6 h-6" />
              <span class="ml-2">Medications List</span>
            </a>
          </li>
        </ul>
      </div>
    {/if}
    {#if isConfigSectionActive()}
    <a href="/master/labServices" class="flex items-center config-link  {isActive('/master/labServices') ? 'active-link' : ''}">
      <CogOutline alt="Config" class="w-6 h-6 mx-2 " />
      <span >Config</span>
    </a>
    {/if}
    </ul>
  </nav>
</aside> 

<style>
  .button:hover {
    color: #ee4d38;
  }
  .active-link {
    color: #ee4d38;
    position: relative;
  }
  .active-link::before {
    content: "";
    position: absolute;
    left: -10px;
    width: 4px;
    height: 100%;
    background-color: #ee4d38;
  }
  .config-link {
    position: absolute;
    bottom: 30px;
  }
  .config-link:hover {
    color: #ee4d38;
    cursor: pointer;
    position: absolute;
    bottom: 30px;
  }
</style>