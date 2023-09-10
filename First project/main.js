document.addEventListener("DOMContentLoaded", function(event){
    function updateDateTime(){
        const day = document.querySelector('[data-testid="currentDayOfTheWeek"]');
        const time = document.querySelector('[data-testid="currentUTCTime"]');
        
        //Get the current day and time
        const now = new Date();
        
        //Get the day of the week
        const daysOfTheWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const dayOfTheWeek = daysOfTheWeek[now.getDay()];
        
        //Get the current time in HH:MM AM/PM UTC Format
        const hours = now.getHours() > 12 ? (now.getHours() - 12) : now.getHours();
        const am_pm = now.getHours() >= 12 ? "PM" : "AM";
        const mins = now.getMinutes().toString().padStart(2, '0');
        

        // Update date and Time
        day.textContent = `Current Day: ${dayOfTheWeek}`;
        time.textContent = `Current Time: ${hours}:${mins} ${am_pm} UTC`;
   }

   //Call the functionality
   updateDateTime();
   //Update the time every minute (60000 milliseconds)
   setInterval(updateDateTime, 60000);
})