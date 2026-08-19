import { ISubscription } from "../../interface/subscription/subscriptionInterface";
import { SubscriptionCreateDTO } from "../../dto/subscription/subscriptionCreateDTO";
import { SubscriptionResponseDTO } from "../../dto/subscription/subscriptionResponceDTO";
import { SubscriptionUpdateDTO } from "../../dto/subscription/updateDTO";

export class SubscriptionMapper {
  static toDomain(dto: SubscriptionCreateDTO): Partial<ISubscription> {
    return {
      name: dto.name,
      features: dto.features,
      pricing: dto.pricing.map((tier) => ({
        durationMonths: tier.durationMonths,
        price: tier.price,
      })),
      status: dto.status ?? "active",
    };
  }

  static toResponseDTO(doc: any): SubscriptionResponseDTO {
    return {
      id: doc._id.toString(),
      name: doc.name,
      features: doc.features,
      pricing: doc.pricing.map((tire: any) => ({
        durationMonths: tire.durationMonths,
        price: tire.price,
      })),
      status: doc.status,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
  static toUpdateDomain(dto:SubscriptionUpdateDTO):Partial<ISubscription>{

    const domain:Partial<ISubscription> = {}
    if (dto.name !== undefined) domain.name = dto.name;
    if (dto.features !== undefined) domain.features = dto.features
    if(dto.pricing !== undefined){
      domain.pricing = dto.pricing.map((t)=>({
        durationMonths:t.durationMonths,
        price:t.price
      }))
    }
    return domain
  }
}
