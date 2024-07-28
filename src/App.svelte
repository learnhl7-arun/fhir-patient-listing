<script lang="ts">
  import { Router, Route } from "svelte-routing";
  import LandingScreen from "./components/LandingScreen.svelte";
  import Sidebar from "./components/Sidebar.svelte";
  import PatientHeader from "./components/PatientHeader.svelte";
  import { currentPath } from "./stores/pathStore";
  import { get } from 'svelte/store';
  import { patientStore } from './stores/patientStore';
  import { onMount } from "svelte";
  import PatientVitals from "./components/PatientVitals.svelte";
  import PatientLabRequest from "./components/PatientLabRequest.svelte";
  import DoctorsScreen from "./components/DoctorsScreen.svelte";
  import LabServices from "./components/LabServices.svelte";

  let showPatientHeader = get(currentPath).startsWith("/patient/");
  currentPath.subscribe(value => {
    showPatientHeader = value.startsWith("/patient/");
  });

  function handleGlobalClick(event) {
    // Logic to determine the new patientId based on the click event
    const clickedElement = event.target;
    const newPatientId = clickedElement.dataset.patientId;

    if (newPatientId) {
      patientStore.set({ id: newPatientId, name: 'Patient Name', birthDate: '2000-01-01', gender: 'male' });
    }
  }

  // Add the click event listener to the entire document
  onMount(() => {
    document.addEventListener('click', handleGlobalClick);
    return () => {
      document.removeEventListener('click', handleGlobalClick);
    };
  });
</script>

<div class="bg-base-layer h-screen w-screen relative">
  <div
    class="absolute left-red-rect-right top-red-rect-top w-sidebar h-red-rectangle bg-accent-red rounded-2xl ml-6 mt-5"
  ></div>
  <div
    class="absolute left-main-right top-main-top w-main-content h-main-screen bg-main-bg rounded-3xl shadow-lg flex overflow-hidden ml-14 mt-10"
  >
    <!-- Screen components goes here -->
    <div class="w-sidebar bg-sidebar-bg rounded-l-xl p-4 top-main-top">
      <Sidebar />
    </div>

    <main class="flex-1 flex flex-col">
      {#if showPatientHeader}
        <PatientHeader />
      {/if}
      <Router>
        <Route path="/patientList" component={LandingScreen} />
        <Route
          path="/patient/:id/vitals"
          component={PatientVitals}
        />
        <Route
          path="/patient/:id/labRequest"
          component={PatientLabRequest}
        />
        <Route
          path="/master/doctor"
          component={DoctorsScreen}
        />
        <Route
          path="/master/labServices"
          component={LabServices}
        />
        
        <!-- <Route
        path="/master/medicationsList"
        component={MedicationMaster}
      /> -->

      
      </Router>
    </main>
  </div>
</div>
