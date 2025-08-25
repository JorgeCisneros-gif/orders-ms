import { IsEnum, IsOptional } from "class-validator";
import { PaginationDto } from "src/common";
import {  OrderStatusList } from "../enum/orders.enum";
import { OrderStatus } from "@prisma/client";

export class PaginatioonOrderDto extends PaginationDto{

  @IsEnum(OrderStatusList, {
    message: `Possible status values are ${OrderStatusList}` 
  })
  @IsOptional()
  status: OrderStatus 

  
}