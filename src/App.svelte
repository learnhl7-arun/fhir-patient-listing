<script lang="ts">
  import { Router, Route } from "svelte-routing";
  import LandingScreen from "./components/LandingScreen.svelte";
  import Sidebar from "./components/Sidebar.svelte";
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

    <main class="flex-1  flex flex-col">
      <Router>
        <Route path="/patientList" component={LandingScreen} />
      </Router>
    </main>
  </div>
</div>
