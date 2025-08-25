import { Controller, NotImplementedException, ParseUUIDPipe } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { PaginatioonOrderDto } from './dto/pagination-order.dto';
import { ChangeOrdereStatusDto } from './dto';


@Controller()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @MessagePattern('createOrder')
  create(@Payload() createOrderDto: CreateOrderDto) {
    
    
    return this.ordersService.create(createOrderDto);
  }

  @MessagePattern('findAllOrders')
  findAll( @Payload() paginatioonOrderDto: PaginatioonOrderDto) {
    
    return this.ordersService.findAll(paginatioonOrderDto);
  }

  @MessagePattern('findOneOrder')
  findOne(@Payload('id',ParseUUIDPipe) id: string) {
    return this.ordersService.findOne(id)
  }

  @MessagePattern('changeOrderStatus')
  changeOrdereStatus(@Payload() changeOrdereStatus:ChangeOrdereStatusDto){
   return this.ordersService.changeStatus(changeOrdereStatus)
   
  }

}
