<script>
  import {
    HomeOutline,
    PlusOutline,
    FileCheckOutline,
    UserOutline,
    LandmarkOutline,
  } from "flowbite-svelte-icons";

  import { navigate } from "svelte-routing";
  import logo from "../assets/logo.png";

  //variable for navigation
  let currentLocation = window.location.pathname;

  // Function to navigate to a new path and update currentLocation
  // @ts-ignore
  function navigateTo(path) {
    navigate(path);
    currentLocation = path;
  }

  // @ts-ignore
  function goToHome(event) {
    event.preventDefault();
    navigateTo("/patientList");
  }

  //Function to check if current navlink is active
  // @ts-ignore
  function isActive(path) {
    return currentLocation.startsWith(path);
  }
</script>

<aside class="bg-sidebar-bg w-full h-full p-4 text-gray-700 rounded-l-xl">
  <!-- <div class="logo mb-6 font-black">LOGO</div> -->

  <nav>
    <ul>
      <li class="my-4">
        <a
          href="/patientList"
          class="flex items-center {isActive('/patientList')
            ? 'active-link'
            : ''}"
          on:click={goToHome}
        >
          <img src={logo} alt="FHIR" height="175" />
        </a>
      </li>
    </ul>
  </nav>
</aside>
