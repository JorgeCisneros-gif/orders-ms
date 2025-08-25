import { IsEnum, IsOptional, IsUUID } from "class-validator";
import { OrderStatusList } from "../enum/orders.enum";
import { OrderStatus } from "@prisma/client";

export class ChangeOrdereStatusDto {
     @IsUUID(4)
    id: string
    
    @IsEnum(OrderStatusList, {
        message: `Possible status values are ${OrderStatusList}` 
      })
      @IsOptional()
      status: OrderStatus 
}