import { Controller, NotImplementedException, ParseUUIDPipe } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { PaginatioonOrderDto } from './dto/pagination-order.dto';
import { ChangeOrdereStatusDto, PaidOrderDto } from './dto';


@Controller()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @MessagePattern('createOrder')
  async create(@Payload() createOrderDto: CreateOrderDto) {
    
    const order = await this.ordersService.create(createOrderDto);
    const  paymnentSession = await this.ordersService.createPaymentSession(order);
    return {order ,paymnentSession};
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
  
  @EventPattern('payment.succeeded')
  paidOrder(@Payload() paidOrderDTO: PaidOrderDto){

    return this.ordersService.paidOrder(paidOrderDTO);
    
  }


}
