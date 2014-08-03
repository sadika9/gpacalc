/*** This method from: http://stackoverflow.com/a/16319855 ***/
function precise_round(num, decimals) {
    var sign = num >= 0 ? 1 : -1;
    return (Math.round((num * Math.pow(10, decimals)) + (sign * 0.001)) / Math.pow(10, decimals)).toFixed(decimals);
} 
