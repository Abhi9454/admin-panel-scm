// src/api/schoolApi.ts


var sampleSchoolDetails = {
    "schoolname": "Springfield High School",
    "schoolimage": "https://static1.squarespace.com/static/5fbef6bf1c8c741314267f98/t/651265a597bc7a51d3f829e9/1695704485643/PTA%2BLogo%2BMaster.png",
    "schooladdress": "1234 Elm Street, Springfield, IL",
    "schoolcode": "sps"
  }
  
  
  const getSchoolDetailsFromCode = async (schoolCode) =>{
    try {
     // const response = await fetch(`https://api.example.com/schools/${schoolCode}`);
      
    //   if (!response.ok) {
    //     throw new Error("School not found");
    //   }
    console.log(schoolCode)
      
    //   const data = await response.json();
      return sampleSchoolDetails;
    } catch (error) {
      console.error(error);
      return null;
    }
  };
  
  export default getSchoolDetailsFromCode;
  