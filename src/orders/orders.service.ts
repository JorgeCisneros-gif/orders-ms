import { HttpStatus, Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { PrismaClient } from '@prisma/client';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { PaginatioonOrderDto } from './dto/pagination-order.dto';
import { ChangeOrdereStatusDto, PaidOrderDto } from './dto';
import { NATS_SERVICE } from 'src/config/services';
import { firstValueFrom } from 'rxjs';
import { OrderWithProducts } from './interface/order-with-products.interface';

@Injectable()
export class OrdersService extends PrismaClient implements OnModuleInit{

constructor(
    @Inject(NATS_SERVICE) private readonly productsClient: ClientProxy
  ) {
  super();
}

  private readonly logger = new Logger('OrdersService')
     
    async onModuleInit() {
    await this.$connect();
    this.logger.log('Database connected')
  }


  async create(createOrderDto: CreateOrderDto) {
   
    try {
      const productIds = createOrderDto.items.map( itme => itme.productId)
      const products: any [] = await firstValueFrom(this.productsClient.send({cmd:'validate_prodducts'},productIds)) ;

      //Calculo de los Valores
      const totalAmount = createOrderDto.items.reduce((acc, orderItem)=>{

          const price = products.find(
             (product) => product.id === orderItem.productId,
            ).price;
          return acc + price * orderItem.quantity
      },0);

      const totalItems = createOrderDto.items.reduce((acc,orderItem)=>{

        return acc + orderItem.quantity;
      },0 );

      //crear  transaccion de bd

      const order = await this.order.create({
        data:{ 
          totalItems: totalItems,
          totalAmount:totalAmount,
          OrderItem:{
            createMany:
              {
                data:createOrderDto.items.map((orderItem)=>({
                  price: products.find(product => product.id === orderItem.productId ).price,
                  productId:orderItem.productId,
                  quantity: orderItem.quantity,

                }))
              }
            
          }
          
        },
        include:{
          OrderItem: {
            select:{
              price:true,
              quantity:true,
              productId:true,
            }
          }
          
        }

      })
return {
  ...order,
  OrderItem: order.OrderItem.map((orderItem)=>({
    ...orderItem,
    name: products.find(product => product.id ===orderItem.productId ).name

  }))

}

    } catch (error) {
    throw new RpcException({
      status: HttpStatus.BAD_REQUEST,
      message:`Error : ${error}`
    })  
    }


    
    // return {
    //   service :'Orders MIcroservice',
    //   createOrderDto: createOrderDto
    // }
  
    // return this.order.create( {
    //   data: createOrderDto
    
    // })
  }

  async findAll( paginatioonOrderDto: PaginatioonOrderDto) {
    const { page , limit} = paginatioonOrderDto;
    const totalPage = await this.order.count({where: {status: paginatioonOrderDto.status}} );
    const lastpage =  Math.ceil(totalPage / limit!)

    return {
      data: await this.order.findMany({
        skip: (page! -1 ) * limit! as number,
      take: limit,
      where: {status: paginatioonOrderDto.status}

      }),
      meta:{
      Total :totalPage,
      page:page,
      lastpage:lastpage,
      pagina: `${page} de ${lastpage }` 

    }
      

    }

  
  }

  async findOne(id: string) {
    const order = await this.order.findFirst({
      where:{id: id},
      include:{
        OrderItem:{
          select:{
            price:true,
            quantity:true,
            productId:true,

          }
        }
      }
    });
    
    if (!order){
      throw new RpcException({ 
        status: HttpStatus.NOT_FOUND,
        message:`Order with ID ${id} not found`
      })
    }

     const productIds = order.OrderItem.map(orderItem => orderItem.productId )
     const products: any [] = await firstValueFrom(this.productsClient.send({cmd:'validate_prodducts'},productIds)) ;

    ////



    return{
      ...order,
      OrderItem: order.OrderItem.map(orderItem =>({
        ...orderItem,
        name: products.find(product => product.id === orderItem.productId ).name,
        

      }))
    }
  }


  async changeStatus(changeOrdereStatus: ChangeOrdereStatusDto) {
    const {id , status} = changeOrdereStatus
    const order = await this.findOne(id);

    if (order.status === status){
      return order;
    }


  return this.order.update({
    where: {id},
    data: {status}
  });
  
  
  }


async createPaymentSession(order: OrderWithProducts) {
  const paymentSession = await firstValueFrom(
    this.productsClient.send( 'create.payments.session', {
      orderId: order.id,
      currency: 'usd',
      items: order.OrderItem.map(item => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity
      }))
    })
  );
return paymentSession;

}



async paidOrder(paidOrderDTO: PaidOrderDto) {
this.logger.log(`Order paid: ${paidOrderDTO.orderId}`)
const updateOrder = await this.order.update({
  where: { id: paidOrderDTO.orderId },
  data: { status: 'PAID', 
          paid: true,
          paidAt: new Date(),
          stripeChargeId: paidOrderDTO.stripePaymentId,

          //
          OrderReceipt:{
            create:{
              receiptUrl: paidOrderDTO.receiptUrl
            }
          }


          }
});


return updateOrder;
}
}
