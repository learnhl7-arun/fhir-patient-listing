<!-- PatientHeader.svelte -->
<script>
  import { patientStore } from "../stores/patientStore";
  import { UserCircleOutline} from "flowbite-svelte-icons";
    import { Button } from "flowbite-svelte";

  let patient = {
    id: "",
    name: "",
    birthDate: "",
    gender: ""
  };

  patientStore.subscribe(value => {
    patient = value;
  });
</script>

<div class="bg-accent-red text-white p-6 m-4 mr-5 lg:p-3 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
 
  <!-- Avatar icon -->
  <div class="flex items-center mb-4 md:mb-0">
    <Button >
    <UserCircleOutline alt="Patient" class="w-15 h-12 mr-2" />
    </Button>
    <div>
      <h2 class="text-3xl lg:text-2xl xl:text-3xl font-bold">{patient.name}</h2>
      <p>ID: {patient.id}</p>
    </div>
  </div>
  
  <div class="mt-4 md:mt-0 text-left md:text-right font-bold mr-6">
    <p>Date of Birth: {patient.birthDate}</p>
    <p>Gender: {patient.gender}</p>
  </div>
</div>
