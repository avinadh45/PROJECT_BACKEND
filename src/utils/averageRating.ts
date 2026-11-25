
export function averageRating(stats?: { count:number; total:number}): number | undefined { 

    return stats && stats.count > 0 ? Math.round((stats.total / stats.count)*10)/10 : undefined
}