import Stripe from 'stripe';
const stripe = new Stripe('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', {
  apiVersion: '2022-11-15',
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { checkin, checkout, ospiti, appartamento_id } = req.body;

    const checkinDate = new Date(checkin);
    const checkoutDate = new Date(checkout);
    const diffTime = Math.abs(checkoutDate - checkinDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let prezzoBase = 80;
    let extra = 0;
    if (ospiti > 2) {
      extra = (ospiti - 2) * 20;
    }
    const importo = diffDays * (prezzoBase + extra);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `Prenotazione Antico Borgo Monregale – Appartamento ${appartamento_id}`,
            },
            unit_amount: importo * 100,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: 'https://www.anticoborgomonregale.it/successo.html',
      cancel_url: 'https://www.anticoborgomonregale.it/prenota.html',
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
