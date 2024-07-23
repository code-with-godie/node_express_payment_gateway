import Stripe from 'stripe';
const stripe = Stripe(
  'sk_test_51PfMdIFZTiU4wb6Hc3SsAYekiMYiTCcMeyCvL3KvnMnYApCv245gJlBUiFAPnsUCU6PCUf5ynog5DfPoiJj1ziMp00fvlxjkfb'
);
export const payWithStripe = async (req, res) => {
  try {
    const customer = await stripe.customers.create({
      metadata: {
        userId: req.body.userId,
        cart: JSON.stringify(req.body.cartItems),
      },
    });

    const line_items = req.body.cartItems.map((item) => {
      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name,
            images: [item.image],
            description: item.description,
            metadata: {
              id: item.$id,
            },
          },
          unit_amount: item.price,
        },
        quantity: item.amount,
      };
    });
    //options for shipping
    // const  shipping_options = [
    //     {
    //       shipping_rate_data: {
    //         type: 'fixed_amount',
    //         fixed_amount: {
    //           amount: 0,
    //           currency: 'usd',
    //         },
    //         display_name: 'Free shipping',
    //         // Delivers between 5-7 business days
    //         delivery_estimate: {
    //           minimum: {
    //             unit: 'business_day',
    //             value: 5,
    //           },
    //           maximum: {
    //             unit: 'business_day',
    //             value: 7,
    //           },
    //         },
    //       },
    //     },
    //     {
    //       shipping_rate_data: {
    //         type: 'fixed_amount',
    //         fixed_amount: {
    //           amount: 1500,
    //           currency: 'usd',
    //         },
    //         display_name: 'Next day air',
    //         // Delivers in exactly 1 business day
    //         delivery_estimate: {
    //           minimum: {
    //             unit: 'business_day',
    //             value: 1,
    //           },
    //           maximum: {
    //             unit: 'business_day',
    //             value: 1,
    //           },
    //         },
    //       },
    //     },
    //   ]
    // return res.json({ success: true, line_items });
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'KE'],
      },
      phone_number_collection: {
        enabled: true,
      },
      line_items,
      mode: 'payment',
      customer: customer.id,
      success_url: `${process.env.CLIENT_URL}/checkout-success`,
      cancel_url: `${process.env.CLIENT_URL}/cart`,
    });
    res.json({ success: true, url: session.url });
  } catch (error) {
    res.json({ success: false, error });
    // throw new Error(error);
  }
};
