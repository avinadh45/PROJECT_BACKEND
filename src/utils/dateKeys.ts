export const TZ = "Asia/Kolkata";
export const TZ_OFFSET = "+05:30";


export const todayKey = ():string => 
    new Intl.DateTimeFormat("en-CA", { timeZone:TZ}).format(new Date())

export const addDays = (key: string, days:number): string =>{

    const [y,m,d] = key.split("-").map(Number) 
    return new Date(Date.UTC(y,m-1,d+days)).toISOString().slice(0,10)
}

export const addMonths = (monthKey: string, months: number): string => {   
  const [y, m] = monthKey.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1 + months, 1)).toISOString().slice(0, 7);
};

export const startOfDay = (key: string):Date => new Date (`${key}T00:00:00${TZ_OFFSET}`); 

export const startOfMonth = (key:string = todayKey()): Date => startOfDay(`${key.slice(0, 7)}-01`)