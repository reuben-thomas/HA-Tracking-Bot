function UPDATEHASTATUS(expiryDate) {
  
  let d0 = parseInt(expiryDate.split("/")[0]);
  let m0 = parseInt(expiryDate.split("/")[1]);
  let y0 = parseInt(expiryDate.split("/")[2]);
  expiryDate = new Date(y0, m0-1, d0);
  
  let q = new Date()
  q.setDate(q.getDate() - MAX_DAYS_ELAPSED);
  let d1 = q.getDate();
  let m1 = q.getMonth();
  let y1 = q.getFullYear();
  let currDate = new Date(y1,m1,d1);

  if (currDate > expiryDate) {
    return "INVALID";
  }
  else {
    return "VALID";
  }
}


function UPDATEHAWARN(expiryDate) {
  
  let d0 = parseInt(expiryDate.split("/")[0]);
  let m0 = parseInt(expiryDate.split("/")[1]);
  let y0 = parseInt(expiryDate.split("/")[2]);
  expiryDate = new Date(y0, m0-1, d0);
  
  let q = new Date()
  let d1 = q.getDate();
  let m1 = q.getMonth();
  let y1 = q.getFullYear();
  let currDate = new Date(y1,m1,d1);

  if (currDate > expiryDate) {
    return "INVALID";
  }
  else {
    return "VALID";
  }
}



function UPDATEYEAR(y2Date) {
  var currentDate = new Date();
  if(currentDate > y2Date)
  {
    return "Y2";
  }
  else
  {
    return "Y1";
  }
  
}
