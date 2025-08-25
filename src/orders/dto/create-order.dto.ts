import { OrderStatus } from "@prisma/client";
import { ArrayMinSize, IsArray, IsBoolean, IsEnum, IsNumber, IsOptional, IsPositive, ValidateNested } from "class-validator";
import { OrderItemDTO } from "./order-item.dto";
import { Type } from "class-transformer";

export class CreateOrderDto {


    
// @IsNumber()
// @IsPositive()
// totalAmount: number;

// @IsNumber()
// @IsPositive()
// totalItems: number;

// @IsEnum(OrderStatusList, {
//   message: `Possible status values are ${OrderStatusList}` 
// })
// @IsOptional()
// status: OrderStatus = OrderStatus.PENDING

// @IsBoolean()
// @IsOptional()
// paid: boolean = false;
@IsArray()
@ArrayMinSize(1)
@ValidateNested( {each: true})
@Type( () => OrderItemDTO)
items: OrderItemDTO[]




}
