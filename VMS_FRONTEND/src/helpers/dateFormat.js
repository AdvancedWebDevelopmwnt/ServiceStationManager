function dateFormat(date){

    var originalDate = new Date(date);

    // Extract year, month, and day
    var year = originalDate.getFullYear();
    var month = ('0' + (originalDate.getMonth() + 1)).slice(-2); // Months are zero-based
    var day = ('0' + originalDate.getDate()).slice(-2);
    
    // Form the new date string in yyyy-mm-dd format
    var newDateString = year + '-' + month + '-' + day;
    
    return newDateString;
}

export default dateFormat;