export const PLATFORM_FEE_PERCENTAGE = 10; 

export const calcPlatformFee = (amount:number):number => 
    Math.round((amount * PLATFORM_FEE_PERCENTAGE) / 100)