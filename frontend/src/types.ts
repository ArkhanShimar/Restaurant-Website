export type MenuItem={_id:string;name:string;slug:string;description:string;category:string;price:number;image:string;dietary:string[];featured:boolean;available:boolean;prepTime:number;variants:{name:string;priceDelta:number}[];addOns:{name:string;price:number}[]};
export type CartItem={key:string;menuItem:string;name:string;price:number;quantity:number;image:string;variant?:string;addOns:{name:string;price:number}[];spiceLevel?:string;notes?:string};
export type Order={_id:string;orderNumber:string;customerName:string;type:string;table?:string;items:CartItem[];total:number;status:string;createdAt:string;paymentStatus:string};

