// Ready-made content for each business type.
// {link} is replaced with the vendor's own shop link. Words in [brackets] are for the vendor to change.

const REEL = "Reels, TikTok";
const STATUS = "WhatsApp Status, Reels";

const shared = {
  pack: {
    title: "Pack an order with me",
    hook: "Come and watch me pack an order.",
    say: "Packing an order for a customer in [city]. Thank you for trusting my business. Want yours? The link is in my bio.",
    post: "WhatsApp Status, TikTok",
  },
  review: {
    title: "Show a happy customer",
    hook: "Look at what my customer said.",
    say: "[Customer name] ordered [item] and sent me this message. Thank you. Your order could be next. (Show the screenshot or photo, with their permission.)",
    post: "WhatsApp Status, Facebook",
  },
  last: {
    title: "Last pieces left",
    hook: "Only [number] left. After this, it's gone.",
    say: "[Item] is almost finished. Only [number] left. Order now before somebody else does. The link is in my bio.",
    post: STATUS,
  },
};

export const CONTENT = {
  clothing: {
    label: "Clothing & Fashion",
    ideas: [
      {
        title: "Introduce your brand",
        hook: "If you love clean, sharp outfits, watch this.",
        say: "I sell [men's / women's / all] clothes in [city]. Every item is real and checked before it leaves my hands. See every price on my link and order on WhatsApp.",
        post: STATUS,
      },
      {
        title: "Show one item",
        hook: "This one is going fast.",
        say: "This is [item]. Sizes: [sizes]. Price: [₦price]. Perfect for [church, work, owambe, weekend]. Tap the link to order.",
        post: REEL,
      },
      {
        title: "One item, three looks",
        hook: "One outfit, three looks. Which one is yours?",
        say: "Look one is for work. Look two is for the weekend. Look three is for a night out. Same [item], different vibe. It's on my link.",
        post: REEL,
      },
      {
        title: "Answer a fit question",
        hook: "How do you know your size when you buy clothes online?",
        say: "Measure your [chest, waist, hips] and compare with the size guide. Not sure? Message me on WhatsApp and I'll help you choose.",
        post: "Reels, Facebook",
      },
      shared.pack,
      shared.last,
      shared.review,
    ],
    captions: [
      { tag: "New arrival", text: "New in 🔥 [Item] now available in [sizes]. Price: [₦price]. Order on WhatsApp or tap the link in my bio. {link}" },
      { tag: "Link post", text: "Still saying 'DM for price'? All my prices are in one link 👉 {link}" },
      { tag: "Urgency", text: "Only [number] pieces of [item] left. Order before they finish 👉 {link}" },
      { tag: "Trust", text: "Real photos. Fast delivery. Easy ordering. See everything here 👉 {link}" },
    ],
  },

  hair: {
    label: "Hair & Wigs",
    ideas: [
      {
        title: "Introduce your business",
        hook: "Tired of wigs that look fake? Watch this.",
        say: "I sell [wigs, bundles, frontals] in [city]. Real photos, real prices, no surprises. See every length and price on my link.",
        post: STATUS,
      },
      {
        title: "Show a wig or bundle",
        hook: "Look at this texture.",
        say: "This is our [type] in [length]. Price: [₦price]. Soft, full and easy to style. Order on my link.",
        post: REEL,
      },
      {
        title: "How to make your wig last",
        hook: "Your wig will die early if you do this.",
        say: "Three tips: wash it gently, keep it on a stand, and don't sleep in it. Do this and your wig will last longer.",
        post: "Reels, TikTok",
      },
      {
        title: "Before and after styling",
        hook: "Same wig. Look at the difference after styling.",
        say: "Before: just out of the box. After: styled and ready. Want this look? Order on my link.",
        post: REEL,
      },
      {
        title: "Which length suits you?",
        hook: "Which length is for you?",
        say: "[14 inch] gives you [look]. [18 inch] gives you [look]. [22 inch] gives you [look]. All the lengths and prices are on my link.",
        post: "Reels, Facebook",
      },
      shared.pack,
      shared.review,
    ],
    captions: [
      { tag: "New arrival", text: "New wig alert 😍 [Type], [length]. Price: [₦price]. Order here 👉 {link}" },
      { tag: "Link post", text: "All my lengths and prices are on one link. No more 'how much?' 👉 {link}" },
      { tag: "Urgency", text: "Only [number] left in [length]. Order before it finishes 👉 {link}" },
      { tag: "Trust", text: "Real hair photos. Fast delivery. Order easily 👉 {link}" },
    ],
  },

  skincare: {
    label: "Skincare & Body Care",
    note: "Don't promise results or say a product cures a condition. Say 'results differ for each person' and tell customers to test a small area first.",
    ideas: [
      {
        title: "Introduce your business",
        hook: "Looking for skincare you can trust? Watch this.",
        say: "I sell [cleansers, creams, serums, body care] in [city]. Every product is original. See everything on my link and order on WhatsApp.",
        post: STATUS,
      },
      {
        title: "Show one product",
        hook: "This one is a customer favourite.",
        say: "This is [product]. It's for [skin type]. Price: [₦price]. Use it [how to use]. Order on my link.",
        post: REEL,
      },
      {
        title: "A simple routine in 3 steps",
        hook: "A skincare routine you can do in 3 minutes.",
        say: "Step one: cleanse. Step two: moisturise. Step three: protect with sunscreen in the morning. Here are the products I use for each step.",
        post: "Reels, TikTok",
      },
      {
        title: "Answer a customer question",
        hook: "Customers ask me this every day.",
        say: "'Is this good for my skin type?' It depends on your skin. Test a small area first and tell me your skin type on WhatsApp. I'll help you choose. Results differ for each person.",
        post: "Reels, Facebook",
      },
      shared.pack,
      shared.last,
      shared.review,
    ],
    captions: [
      { tag: "New arrival", text: "New in ✨ [Product] for [skin type]. Price: [₦price]. Order here 👉 {link}" },
      { tag: "Link post", text: "All my products and prices in one link 👉 {link}" },
      { tag: "Urgency", text: "Only [number] left of [product]. Order before it finishes 👉 {link}" },
      { tag: "Trust", text: "100% original products. Easy ordering. Delivery in [city] and beyond 👉 {link}" },
    ],
  },

  perfume: {
    label: "Perfume & Fragrance",
    ideas: [
      {
        title: "Introduce your business",
        hook: "Want to smell expensive without paying too much? Watch this.",
        say: "I sell [designer, oil, body spray] perfumes in [city]. See every scent and price on my link and order on WhatsApp.",
        post: STATUS,
      },
      {
        title: "Show one scent",
        hook: "This one gets compliments every time.",
        say: "This is [perfume name]. It smells [fresh, sweet, woody]. Best for [work, dates, weekends]. Price: [₦price]. Order on my link.",
        post: REEL,
      },
      {
        title: "Which scent for which occasion?",
        hook: "Don't wear the wrong perfume to the wrong place.",
        say: "Work: something fresh and light. Date night: something warm and sweet. Owambe: something strong that people will notice. Here are my picks for each one.",
        post: "Reels, Facebook",
      },
      {
        title: "Make your perfume last longer",
        hook: "Your perfume disappears too fast? Do this.",
        say: "Spray on clean, moisturised skin. Spray your wrists and neck. Don't rub your wrists together. Your scent will last longer.",
        post: "Reels, TikTok",
      },
      {
        title: "Gift idea",
        hook: "Looking for a gift? Don't get it wrong.",
        say: "A perfume is always a good gift. I have options under [₦price] and under [₦price]. See them on my link, and I can wrap it for you.",
        post: STATUS,
      },
      shared.pack,
      shared.review,
    ],
    captions: [
      { tag: "New arrival", text: "New scent 🔥 [Perfume name]. [Fresh/sweet/woody]. Price: [₦price]. Order here 👉 {link}" },
      { tag: "Link post", text: "All my perfumes and prices in one link 👉 {link}" },
      { tag: "Gift", text: "Looking for a gift? A good perfume is always a good idea 🎁 {link}" },
      { tag: "Trust", text: "Original perfumes. Fast delivery. Easy ordering 👉 {link}" },
    ],
  },

  jewellery: {
    label: "Jewellery",
    ideas: [
      {
        title: "Introduce your business",
        hook: "Looking for jewellery that makes your outfit stand out? Watch this.",
        say: "I sell [necklaces, rings, bracelets, earrings] in [city]. See every piece and price on my link and order on WhatsApp.",
        post: STATUS,
      },
      {
        title: "Show one piece",
        hook: "Look at the shine on this.",
        say: "This is [piece name]. Made of [material]. Price: [₦price]. Perfect for [weddings, church, everyday]. Order on my link.",
        post: REEL,
      },
      {
        title: "Style one piece 3 ways",
        hook: "One necklace, three looks.",
        say: "With a plain top. With a dress. With a native. Same piece, three different looks. It's on my link.",
        post: REEL,
      },
      {
        title: "Keep your jewellery looking new",
        hook: "Your jewellery will turn dull if you do this.",
        say: "Keep it dry. Store it in a box or pouch. Put it on after your perfume, not before. Do this and it lasts longer.",
        post: "Reels, TikTok",
      },
      {
        title: "Gift idea",
        hook: "A gift she will actually wear.",
        say: "I have gifts under [₦price] and under [₦price]. See the full list on my link and I'll pack it nicely.",
        post: STATUS,
      },
      shared.pack,
      shared.review,
    ],
    captions: [
      { tag: "New arrival", text: "New piece ✨ [Name], [material]. Price: [₦price]. Order here 👉 {link}" },
      { tag: "Link post", text: "All my jewellery and prices in one link 👉 {link}" },
      { tag: "Gift", text: "Looking for a gift? Find it here 🎁 {link}" },
      { tag: "Urgency", text: "Only [number] left of [piece]. Order before it finishes 👉 {link}" },
    ],
  },

  gadgets: {
    label: "Gadgets & Accessories",
    ideas: [
      {
        title: "Introduce your business",
        hook: "Before you buy a gadget online, watch this.",
        say: "I sell [phones, earbuds, chargers, accessories] in [city]. Every item is tested before I send it. See everything on my link.",
        post: STATUS,
      },
      {
        title: "Show one item",
        hook: "This is the one everyone is asking for.",
        say: "This is [item]. It has [key feature, battery, storage]. Price: [₦price]. [Warranty / how long it's covered]. Order on my link.",
        post: REEL,
      },
      {
        title: "What to check before you buy",
        hook: "Three things to check before buying a gadget.",
        say: "One: is it original? Two: what is the warranty? Three: does it come with a charger? Here is how we handle each one.",
        post: "Reels, Facebook",
      },
      {
        title: "Unbox with me",
        hook: "Let's open this together.",
        say: "Opening [item]. In the box you get [what's inside]. Look at the quality. Order yours on my link.",
        post: REEL,
      },
      {
        title: "Accessories that go together",
        hook: "Don't buy your phone without this.",
        say: "A good case, a screen protector and a fast charger protect your phone. Here are the ones I recommend and their prices.",
        post: "Reels, TikTok",
      },
      shared.last,
      shared.review,
    ],
    captions: [
      { tag: "New arrival", text: "New in 🔥 [Item]. [Key feature]. Price: [₦price]. Order here 👉 {link}" },
      { tag: "Link post", text: "All my gadgets and prices in one link 👉 {link}" },
      { tag: "Urgency", text: "Only [number] left of [item]. Order before it finishes 👉 {link}" },
      { tag: "Trust", text: "Tested items. Clear prices. Easy ordering 👉 {link}" },
    ],
  },

  bags: {
    label: "Bags & Shoes",
    ideas: [
      {
        title: "Introduce your business",
        hook: "If you love good bags and shoes, watch this.",
        say: "I sell [bags, sneakers, heels, sandals] in [city]. See every item and price on my link and order on WhatsApp.",
        post: STATUS,
      },
      {
        title: "Show one item",
        hook: "Look at the details on this one.",
        say: "This is [item]. Sizes: [sizes]. Price: [₦price]. Perfect for [work, church, outings]. Order on my link.",
        post: REEL,
      },
      {
        title: "Style it with 3 outfits",
        hook: "One pair, three outfits.",
        say: "With jeans. With a dress. With a native. Same [item], three different looks. See it on my link.",
        post: REEL,
      },
      {
        title: "Help with shoe size",
        hook: "Not sure of your shoe size? Do this.",
        say: "Measure your foot in the evening, when it's biggest. Compare with the size chart. Still not sure? Send me your size on WhatsApp.",
        post: "Reels, Facebook",
      },
      {
        title: "How to clean your bag or shoes",
        hook: "Stop throwing away shoes that just need cleaning.",
        say: "Brush off the dirt first. Wipe with a damp cloth and mild soap. Let it dry in the shade. That's all it takes.",
        post: "Reels, TikTok",
      },
      shared.pack,
      shared.review,
    ],
    captions: [
      { tag: "New arrival", text: "New in 🔥 [Item]. Sizes: [sizes]. Price: [₦price]. Order here 👉 {link}" },
      { tag: "Link post", text: "All my bags, shoes and prices in one link 👉 {link}" },
      { tag: "Urgency", text: "Only [number] pairs left in [size]. Order before they finish 👉 {link}" },
      { tag: "Trust", text: "Real photos. Fast delivery. Easy ordering 👉 {link}" },
    ],
  },

  furniture: {
    label: "Furniture",
    ideas: [
      {
        title: "Introduce your business",
        hook: "Want a home that looks expensive? Watch this.",
        say: "I make and sell [sofas, beds, tables, wardrobes] in [city]. See every piece, its size and price on my link.",
        post: STATUS,
      },
      {
        title: "Show one piece",
        hook: "Look at the finishing on this.",
        say: "This is [piece]. Size: [dimensions]. Material: [material]. Price: [₦price]. Delivery within [days]. Order on my link.",
        post: REEL,
      },
      {
        title: "How to choose the right size",
        hook: "Don't buy furniture before you do this.",
        say: "Measure your room and your door first. Leave space to walk around it. Not sure? Send me the room size and I'll suggest what fits.",
        post: "Reels, Facebook",
      },
      {
        title: "Behind the scenes",
        hook: "This is how your furniture is made.",
        say: "Here we are cutting, sanding and finishing a [piece]. Every part is checked before delivery.",
        post: REEL,
      },
      {
        title: "Delivery day",
        hook: "Watch this delivery.",
        say: "Delivering a [piece] to a customer in [area]. Careful packing, on time. Want yours? The link is in my bio.",
        post: "WhatsApp Status, TikTok",
      },
      shared.last,
      shared.review,
    ],
    captions: [
      { tag: "New piece", text: "New in 🛋️ [Piece], [material]. Size: [dimensions]. Price: [₦price]. See it here 👉 {link}" },
      { tag: "Link post", text: "All my furniture, sizes and prices in one link 👉 {link}" },
      { tag: "Urgency", text: "Only [number] left of [piece]. Order before it finishes 👉 {link}" },
      { tag: "Trust", text: "Quality finishing. Clear prices. Delivery in [city] 👉 {link}" },
    ],
  },

  restaurant: {
    label: "Restaurant & Food",
    ideas: [
      {
        title: "Introduce your food",
        hook: "Hungry? Watch this.",
        say: "I sell [type of food] in [area]. Fresh, hot and on time. See the full menu with prices on my link and order on WhatsApp.",
        post: STATUS,
      },
      {
        title: "Show one dish",
        hook: "Look at this plate.",
        say: "This is [dish]. Price: [₦price]. Made fresh today. Order on my link.",
        post: REEL,
      },
      {
        title: "Today's special",
        hook: "Today's special is here.",
        say: "Today we have [dish] for [₦price]. Order before [time] and get it hot at your door. See the menu on my link.",
        post: "WhatsApp Status, Facebook",
      },
      {
        title: "In the kitchen",
        hook: "This is how we make it.",
        say: "Watch us cook [dish]. Fresh ingredients, clean kitchen. This is why customers come back.",
        post: REEL,
      },
      {
        title: "How to order",
        hook: "Ordering food from us is easy.",
        say: "Open my link. Choose your food. Send the order on WhatsApp. We'll confirm and deliver. That's it.",
        post: "Reels, WhatsApp Status",
      },
      shared.pack,
      shared.review,
    ],
    captions: [
      { tag: "Today's special", text: "Today's special 😋 [Dish], [₦price]. Order before [time] 👉 {link}" },
      { tag: "Menu", text: "Our full menu and prices are on one link 👉 {link}" },
      { tag: "Weekend", text: "Weekend plans? Let us handle the food 🍽️ Order here 👉 {link}" },
      { tag: "Trust", text: "Fresh. Hot. On time. Order easily 👉 {link}" },
    ],
  },

  realestate: {
    label: "Real Estate",
    note: "Check every document with a lawyer before you advise a buyer. Never post a property without the owner's permission.",
    ideas: [
      {
        title: "Introduce yourself",
        hook: "Looking for land or a house? Watch this.",
        say: "I'm [your name], a real estate agent in [city]. I list [land, houses, apartments] for sale and rent. See every property, with photos and prices, on my link.",
        post: STATUS,
      },
      {
        title: "30-second property tour",
        hook: "Come and see this [house/apartment].",
        say: "This is a [bedrooms]-bedroom [type] in [area]. Price: [₦price]. It has [features]. Message me on WhatsApp to book a viewing.",
        post: REEL,
      },
      {
        title: "Things to check before you buy",
        hook: "Three things to check before buying land.",
        say: "One: visit the site yourself. Two: ask to see the documents. Three: let a lawyer verify them. Never pay before you do these.",
        post: "Reels, Facebook",
      },
      {
        title: "Tour an area",
        hook: "Is [area] a good place to live?",
        say: "Here is what [area] is like: [roads, security, shops, distance to the city]. Rent starts from [₦price]. See properties there on my link.",
        post: "Reels, TikTok",
      },
      {
        title: "New listing",
        hook: "Just listed.",
        say: "New [type] in [area]. [Bedrooms] bedrooms, price [₦price]. Tap the link to see all the photos and ask me anything on WhatsApp.",
        post: STATUS,
      },
      {
        title: "Answer a buyer question",
        hook: "Buyers ask me this all the time.",
        say: "'Can I pay in instalments?' / 'Is the document ready?' Here's how it works with my properties: [your answer]. Ask me anything on WhatsApp.",
        post: "Reels, Facebook",
      },
      shared.review,
    ],
    captions: [
      { tag: "New listing", text: "Just listed 🏠 [Type] in [area]. [Bedrooms] bedrooms. Price: [₦price]. See photos 👉 {link}" },
      { tag: "Link post", text: "All my properties, with photos and prices, on one link 👉 {link}" },
      { tag: "Viewing", text: "Want to see this property? Book a viewing on WhatsApp 👉 {link}" },
      { tag: "Trust", text: "Real properties. Real photos. Verified documents. Ask me anything 👉 {link}" },
    ],
  },

  cars: {
    label: "Car Dealer",
    ideas: [
      {
        title: "Introduce your business",
        hook: "Looking for a car you can trust? Watch this.",
        say: "I sell [brand new, foreign used, Nigerian used] cars in [city]. See every car, with photos and price, on my link.",
        post: STATUS,
      },
      {
        title: "Show one car",
        hook: "Look at this [make and model].",
        say: "This is a [year] [make model]. [Mileage], [transmission], [fuel]. Price: [₦price]. It's in [condition]. Message me on WhatsApp to inspect it.",
        post: REEL,
      },
      {
        title: "Walk around the car",
        hook: "Walk around this car with me.",
        say: "Outside: [condition]. Inside: [condition]. Engine: [condition]. Everything is as you see it. Come and inspect it.",
        post: REEL,
      },
      {
        title: "Things to check before you buy",
        hook: "Three things to check before buying a car.",
        say: "One: the documents. Two: take it for a test drive. Three: let a mechanic inspect it. Don't pay before you do these.",
        post: "Reels, Facebook",
      },
      {
        title: "Budget car options",
        hook: "Looking for a car under [₦price]? See these.",
        say: "These are the cars I have under [₦price]: [cars]. See photos and details on my link.",
        post: "Reels, Facebook",
      },
      {
        title: "Handing over the keys",
        hook: "Another happy customer.",
        say: "Congratulations to [customer name] on the new [car]. Thank you for trusting us. Your car could be next.",
        post: "WhatsApp Status, Facebook",
      },
      shared.review,
    ],
    captions: [
      { tag: "New car", text: "Just in 🚗 [Year] [Make model]. [Mileage], [transmission]. Price: [₦price]. See photos 👉 {link}" },
      { tag: "Link post", text: "All my cars, with photos and prices, on one link 👉 {link}" },
      { tag: "Inspection", text: "Want to see it? Book an inspection on WhatsApp 👉 {link}" },
      { tag: "Trust", text: "Real cars. Real photos. Inspect before you pay 👉 {link}" },
    ],
  },
};

export function kitFor(businessType) {
  return CONTENT[businessType] || CONTENT.clothing;
}