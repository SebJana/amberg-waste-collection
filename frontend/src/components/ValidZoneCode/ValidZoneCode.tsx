export default function checkValidZoneCode(code: string){
    const validCodePattern = /^[A-E][1-4]$/
    // Code is invalid
    if (code == null || code == ""){
        return false;
    }
    // Code doesn't have correct length
    if (code.length != 2){
        return false;
    }
    // Code doesn't name an existing zone
    if (!validCodePattern.test(code)){
        return false;
    }
    return true;
}