// Full video scripts. Each scene is [time, what to show, what to say].
// {link} becomes the vendor's shop link. Words in [brackets] are filled in by the vendor.
// Types not listed here fall back to the short ideas in contentKit.js.

const S = (title, post, length, scenes, caption, tags, tip) => ({
  title,
  post,
  length,
  hook: scenes[0][2],
  scenes,
  caption,
  tags,
  tip,
});

const DAYLIGHT = "Film in daylight near a window. Hold your phone steady with both hands.";

export const SCRIPTS = {
  clothing: [
    S("Introduce your brand", "WhatsApp Status, Reels", "30 sec", [
      ["0-3s", "Stand in front of your clothes rack, smile", "If you love clean, sharp outfits, watch this."],
      ["3-12s", "Slowly show 3 or 4 of your best pieces", "I'm [your name] and I sell [men's / women's / all] clothes in [city]."],
      ["12-22s", "Hold up one item and show the tag or stitching", "Every piece is real and checked before it leaves my hands. No fake photos."],
      ["22-30s", "Point at the camera", "All prices are on my link. Order on WhatsApp. Link in my bio."],
    ], "Meet [brand name] 👋 Real clothes, real prices, easy ordering. See everything here 👉 {link}", "#[city]fashion #naijaclothing #[city]vendor #onlinestore", DAYLIGHT),

    S("Show one item", "Reels, TikTok", "35 sec", [
      ["0-3s", "Hold the item up to the camera", "This one is going fast."],
      ["3-12s", "Close-up of the fabric and stitching", "Look at the quality. Soft, thick, and it won't fade easily."],
      ["12-25s", "Wear it, or hang it up and turn it around", "Sizes: [sizes]. Price: [₦price]. Perfect for [church, work, owambe, weekend]."],
      ["25-35s", "Smile at the camera", "Only [number] left. Order on the link in my bio."],
    ], "Just landed 🔥 [Item], [₦price]. Sizes: [sizes]. Order on WhatsApp 👉 {link}", "#[city]fashion #newarrival #naijafashion #[city]vendor", DAYLIGHT),

    S("One item, three looks", "Reels, TikTok", "30 sec", [
      ["0-3s", "Hold the item up", "One [item], three looks. Which one is yours?"],
      ["3-10s", "Show look one (work outfit)", "Look one: for work. Add [shoes / bag] and you're ready."],
      ["10-18s", "Quick cut to look two (casual)", "Look two: weekend. Relaxed and easy."],
      ["18-25s", "Quick cut to look three (night out)", "Look three: night out. Same [item], different vibe."],
      ["25-30s", "Point at the camera", "Comment 1, 2 or 3. The [item] is on my link."],
    ], "One [item], 3 ways to wear it. Which one are you? 👇 Order here 👉 {link}", "#styleinspo #[city]fashion #howtostyle #naijastyle", "Use the same spot for all three looks so the change is easy to see."),

    S("How to find your size online", "Reels, Facebook", "35 sec", [
      ["0-3s", "Hold a measuring tape", "How do you know your size when you buy clothes online?"],
      ["3-15s", "Measure your chest, waist or hips on camera", "Measure your [chest, waist, hips]. Write the numbers down."],
      ["15-27s", "Show your size guide on your phone", "Now compare with the size guide. Between two sizes? Go for the bigger one."],
      ["27-35s", "Smile at the camera", "Still not sure? Message me on WhatsApp and I'll help you choose. Link in my bio."],
    ], "Not sure of your size? Send me your measurements on WhatsApp and I'll help 💬 {link}", "#sizeguide #onlineshoppingtips #[city]fashion #naijavendor", "Show the real tape and real numbers. It builds trust."),

    S("Pack an order with me", "WhatsApp Status, TikTok", "30 sec", [
      ["0-3s", "Show the item and the empty pack", "Come and watch me pack an order."],
      ["3-15s", "Fold the item neatly, put it in the bag", "This is for a customer in [city]. Every order is checked and folded properly."],
      ["15-24s", "Add a thank-you note and seal the pack", "I always add a thank-you note. Small things matter."],
      ["24-30s", "Show the sealed pack", "Want yours? Link in my bio."],
    ], "Another order on its way 📦 Thank you [customer name]! Yours could be next 👉 {link}", "#packingorders #smallbusinessnigeria #[city]vendor #orderwithme", "Film the packing from above so people can see your hands."),

    S("Last pieces left", "WhatsApp Status", "20 sec", [
      ["0-3s", "Show the few pieces left", "Only [number] left. After this, it's gone."],
      ["3-14s", "Hold up each piece, one by one", "[Item] in [sizes]. Price: [₦price]."],
      ["14-20s", "Point at the camera", "Order now before somebody else does. Link in my bio."],
    ], "Last [number] pieces of [item] ⏳ Order before they finish 👉 {link}", "#lastpieces #[city]fashion #orderNow", "Only post this when it's true. Customers remember."),

    S("Show a happy customer", "WhatsApp Status, Facebook", "20 sec", [
      ["0-3s", "Show the customer's message on your phone", "Look at what my customer said."],
      ["3-14s", "Show the photo or screenshot (with permission)", "[Customer name] ordered [item] and sent me this. Thank you for trusting my business."],
      ["14-20s", "Smile at the camera", "Your order could be next. Link in my bio."],
    ], "Thank you [customer name] 💙 Happy customers are my best advert. Order here 👉 {link}", "#happycustomer #[city]vendor #customerreview", "Always ask the customer first before you post their message or photo."),

    S("Fabric quality test", "Reels, TikTok", "30 sec", [
      ["0-3s", "Hold the fabric up to the light", "Is it see-through? Let me show you."],
      ["3-12s", "Hold it against your hand, then stretch it", "Hold it up. Stretch it. See how it comes back."],
      ["12-22s", "Show the inside seams", "Look at the stitching inside. Neat, strong, no loose threads."],
      ["22-30s", "Hold up the item", "This is [item]. Price: [₦price]. Link in my bio."],
    ], "Quality you can see 👀 [Item], [₦price]. Order on WhatsApp 👉 {link}", "#qualitycheck #[city]fashion #naijaclothing", "Do the test on the actual item you are selling."),

    S("Unboxing new stock", "Reels, TikTok", "35 sec", [
      ["0-3s", "Show the sealed box or bag", "New stock just arrived. Let's open it."],
      ["3-20s", "Open it and show each piece", "Look at this [item]. And this [item]. These are going to sell fast."],
      ["20-30s", "Pick your favourite and hold it up", "My favourite is this one. Sizes: [sizes]. Price: [₦price]."],
      ["30-35s", "Point at the camera", "Everything is on my link. Order early."],
    ], "New stock is here 🔥 See everything and order 👉 {link}", "#newstock #unboxing #[city]fashion #naijavendor", "Open the box slowly. The reveal is what keeps people watching."),

    S("Outfit under a budget", "Reels, TikTok", "30 sec", [
      ["0-3s", "Lay out an outfit on the bed", "A full outfit under [₦budget]. Watch this."],
      ["3-18s", "Point at each piece with its price", "[Item one]: [₦price]. [Item two]: [₦price]. [Item three]: [₦price]."],
      ["18-26s", "Show the total on your phone calculator", "Total: [₦total]. Looking good without breaking the bank."],
      ["26-30s", "Point at the camera", "All of it is on my link. Order on WhatsApp."],
    ], "A full outfit for under [₦budget] 💸 Order here 👉 {link}", "#budgetfashion #outfitidea #[city]fashion #naijastyle", "Work out the total before you film and make sure it's correct."),
  ],

  hair: [
    S("Introduce your business", "WhatsApp Status, Reels", "30 sec", [
      ["0-3s", "Show a wig on a stand", "Tired of wigs that look fake? Watch this."],
      ["3-12s", "Show different wigs and bundles", "I'm [your name] and I sell [wigs, bundles, frontals] in [city]."],
      ["12-22s", "Touch the hair, run your fingers through it", "Real photos, real prices, no surprises. What you see is what you get."],
      ["22-30s", "Point at the camera", "Every length and price is on my link. Order on WhatsApp."],
    ], "Meet [brand name] 💇‍♀️ Real hair photos, real prices. See everything 👉 {link}", "#[city]wigs #wigsnigeria #hairvendor #[city]vendor", DAYLIGHT),

    S("Show a wig", "Reels, TikTok", "35 sec", [
      ["0-3s", "Close-up of the hair", "Look at this texture."],
      ["3-15s", "Run your hand through it, swing it", "Soft, full and easy to style. No shedding."],
      ["15-27s", "Put the wig on a head or model", "This is our [type] in [length]. Price: [₦price]."],
      ["27-35s", "Smile at the camera", "Want it? Order on the link in my bio."],
    ], "New wig alert 😍 [Type], [length]. Price: [₦price]. Order here 👉 {link}", "#wigsnigeria #[city]wigs #newwig #hairvendor", "Show the hair moving. People want to see how it falls."),

    S("3 tips to make your wig last", "Reels, TikTok", "35 sec", [
      ["0-3s", "Hold a wig and shake your head", "Your wig will die early if you do this."],
      ["3-12s", "Show gentle washing", "Tip one: wash it gently with cool water. Don't scrub."],
      ["12-22s", "Put the wig on a stand", "Tip two: keep it on a stand, not in a bag."],
      ["22-30s", "Hold up a sleep bonnet or satin scarf", "Tip three: don't sleep in it. Use a satin bonnet."],
      ["30-35s", "Point at the camera", "Follow for more tips. Need a new wig? Link in my bio."],
    ], "Make your wig last longer 🙌 Save this post! Need a new one? 👉 {link}", "#wigcare #wigtips #wigsnigeria #hairtips", "Show each tip happening. Don't just talk."),

    S("Before and after styling", "Reels, TikTok", "30 sec", [
      ["0-3s", "Show the wig straight out of the box", "Same wig. Look at the difference after styling."],
      ["3-8s", "Show it plain, then wave your hand over the camera", "This is before. Just out of the box."],
      ["8-22s", "Quick cuts of combing, curling and cutting", "Now we style it. Combing, shaping, finishing."],
      ["22-30s", "Show the final look from every side", "After. Ready to wear. Want this look? Link in my bio."],
    ], "Before ➡️ After ✨ [Type] styled and ready. Order yours 👉 {link}", "#wigtransformation #beforeandafter #[city]wigs #hairvendor", "Film before and after from the same angle."),

    S("Which length suits you?", "Reels, Facebook", "30 sec", [
      ["0-3s", "Hold the wig at shoulder level", "Which length is for you?"],
      ["3-10s", "Show a [14 inch] wig", "[14 inch] gives you a neat, easy-to-carry look."],
      ["10-18s", "Show a [18 inch] wig", "[18 inch] gives you a fuller, glamorous look."],
      ["18-25s", "Show a [22 inch] wig", "[22 inch] gives you a long, show-stopping look."],
      ["25-30s", "Point at the camera", "All the lengths and prices are on my link."],
    ], "14, 18 or 22 inches? Tell me your choice 👇 See all lengths 👉 {link}", "#wiglength #wigsnigeria #[city]wigs", "Put the three wigs on stands side by side."),

    S("Pack an order with me", "WhatsApp Status, TikTok", "30 sec", [
      ["0-3s", "Show the wig in its box", "Come and watch me pack an order."],
      ["3-15s", "Wrap the wig, put it in the box with a wig cap", "This is going to [city]. I wrap every wig carefully so it arrives perfect."],
      ["15-24s", "Close the box and write the name", "Thank you [customer name] for choosing me."],
      ["24-30s", "Show the sealed box", "Want yours? Link in my bio."],
    ], "Another one on its way 📦 Thank you [customer name]! 👉 {link}", "#packingorders #wigvendor #[city]vendor", "Show the finished box before you end the video."),

    S("Show a happy customer", "WhatsApp Status, Facebook", "20 sec", [
      ["0-3s", "Show the customer's message", "Look at what my customer said."],
      ["3-14s", "Show her photo with the wig (with permission)", "[Customer name] ordered [type] in [length]. Doesn't she look amazing?"],
      ["14-20s", "Smile at the camera", "Yours could be next. Link in my bio."],
    ], "Thank you [customer name] 💙 Beautiful! Order yours 👉 {link}", "#happycustomer #wigsnigeria #[city]wigs", "Always ask first before you post her photo."),

    S("Wig or bundles?", "Reels, TikTok", "35 sec", [
      ["0-3s", "Hold a wig in one hand and bundles in the other", "Wig or bundles? Here is how to choose."],
      ["3-15s", "Point at the wig", "Wig: ready to wear in minutes. Good if you're always busy."],
      ["15-27s", "Point at the bundles", "Bundles: you can have it installed your way. Good if you love a custom look."],
      ["27-35s", "Smile at the camera", "Still not sure? Message me on WhatsApp and I'll help you choose."],
    ], "Wig or bundles? Tell me your choice 👇 {link}", "#wigorbundles #hairtips #wigsnigeria #[city]wigs", "Keep it simple. One clear benefit for each."),

    S("Unboxing new stock", "Reels, TikTok", "35 sec", [
      ["0-3s", "Show the sealed hair box", "New stock just arrived. Let's open it."],
      ["3-20s", "Open it and show each wig and bundle", "Look at this [type]. And this [type]. Soft and full."],
      ["20-30s", "Hold up your favourite", "My favourite is this one. [Length]. Price: [₦price]."],
      ["30-35s", "Point at the camera", "All of it is on my link. Order early."],
    ], "New hair is in 😍 See everything 👉 {link}", "#newstock #hairunboxing #wigsnigeria #[city]wigs", "Open the box slowly and let the camera see inside."),

    S("Last pieces left", "WhatsApp Status", "20 sec", [
      ["0-3s", "Show the last wigs", "Only [number] left in [length]. After this, it's gone."],
      ["3-14s", "Hold up each one", "[Type], [length]. Price: [₦price]."],
      ["14-20s", "Point at the camera", "Order now before somebody else does. Link in my bio."],
    ], "Last [number] pieces in [length] ⏳ Order before they finish 👉 {link}", "#lastpieces #wigsnigeria #[city]wigs", "Only post this when it's true. Customers remember."),
  ],

  skincare: [
    S("Introduce your business", "WhatsApp Status, Reels", "30 sec", [
      ["0-3s", "Hold up a few products", "Looking for skincare you can trust? Watch this."],
      ["3-12s", "Show your products on a shelf", "I'm [your name] and I sell [cleansers, creams, serums, body care] in [city]."],
      ["12-22s", "Show a box with the seal or batch details", "Every product is original and comes from trusted sources."],
      ["22-30s", "Point at the camera", "See everything on my link and order on WhatsApp."],
    ], "Meet [brand name] ✨ Original skincare, easy ordering. Everything here 👉 {link}", "#[city]skincare #skincarenigeria #[city]vendor #bodycare", DAYLIGHT),

    S("Show one product", "Reels, TikTok", "35 sec", [
      ["0-3s", "Hold the product to the camera", "This one is a customer favourite."],
      ["3-15s", "Open it, show the texture on your hand", "This is [product]. It's for [skin type]. See how smooth the texture is."],
      ["15-27s", "Show how you use it", "How to use it: [how to use]. Results differ for each person."],
      ["27-35s", "Hold up the product", "Price: [₦price]. Order on the link in my bio."],
    ], "Customer favourite ✨ [Product] for [skin type]. [₦price]. Order here 👉 {link}", "#skincarenigeria #[city]skincare #skincareroutine", "Show the texture on your hand in good light."),

    S("A routine in 3 steps", "Reels, TikTok", "35 sec", [
      ["0-3s", "Show three products lined up", "A skincare routine you can do in 3 minutes."],
      ["3-12s", "Show cleansing your face", "Step one: cleanse. Wash off the dirt and oil of the day."],
      ["12-22s", "Show applying moisturiser", "Step two: moisturise. Keep your skin soft."],
      ["22-30s", "Show sunscreen going on", "Step three: sunscreen in the morning, every day."],
      ["30-35s", "Hold the three products", "All three are on my link. Results differ for each person."],
    ], "3 steps, 3 minutes ✨ Save this routine! Products here 👉 {link}", "#skincareroutine #skincarenigeria #[city]skincare", "Keep the three products in the same order throughout."),

    S("Answer a customer question", "Reels, Facebook", "30 sec", [
      ["0-3s", "Look at the camera", "Customers ask me this every day: is this good for my skin type?"],
      ["3-15s", "Hold the product", "It depends on your skin. Oily, dry, sensitive: each is different."],
      ["15-24s", "Show a small test on the inner arm", "Always test a small area first before you use it on your face."],
      ["24-30s", "Smile at the camera", "Not sure? Tell me your skin type on WhatsApp and I'll help you choose."],
    ], "Not sure what suits your skin? Message me 💬 {link}", "#skincaretips #skincarenigeria #[city]skincare", "Never say a product will fix a skin problem. Say results differ."),

    S("What does it do? Explained simply", "Reels, TikTok", "35 sec", [
      ["0-3s", "Hold up the product", "Do you know what [ingredient] does?"],
      ["3-15s", "Point at the label", "[Ingredient] is commonly used to [simple benefit, e.g. moisturise]."],
      ["15-27s", "Show the product in use", "You can find it in this [product]. Use it [how to use]."],
      ["27-35s", "Point at the camera", "Results differ for each person. Questions? Message me on WhatsApp."],
    ], "Know your ingredients 🔍 [Product] with [ingredient]. 👉 {link}", "#skincareingredients #skincarenigeria #[city]skincare", "Say what an ingredient is commonly used for. Don't promise results."),

    S("Pack an order with me", "WhatsApp Status, TikTok", "30 sec", [
      ["0-3s", "Show the product and an empty box", "Come and watch me pack an order."],
      ["3-15s", "Wrap the product in bubble wrap and place it in the box", "This is for a customer in [city]. I wrap each product so nothing breaks."],
      ["15-24s", "Add a thank-you note", "A small thank-you note for every customer."],
      ["24-30s", "Seal the box", "Want yours? Link in my bio."],
    ], "Another order on its way 📦 Thank you [customer name]! 👉 {link}", "#packingorders #[city]vendor #skincarenigeria", "Film from above and keep the products clean and tidy."),

    S("How to do a patch test", "Reels, Facebook", "30 sec", [
      ["0-3s", "Hold up a new product", "Before you use any new product, do this first."],
      ["3-13s", "Apply a small amount on your inner arm", "Put a small amount on your inner arm or behind your ear."],
      ["13-23s", "Show a clock or a phone timer", "Wait 24 hours. If you see redness, itching or irritation, don't use it."],
      ["23-30s", "Smile at the camera", "Safe skin first. Questions? Message me on WhatsApp."],
    ], "Patch test before you use anything new 🙌 Stay safe! 👉 {link}", "#patchtest #skincaretips #skincarenigeria", "This builds trust. Customers love vendors who care about safety."),

    S("Show a happy customer", "WhatsApp Status, Facebook", "20 sec", [
      ["0-3s", "Show the customer's message", "Look at what my customer said."],
      ["3-14s", "Show the message with her permission", "[Customer name] has been using [product]. Results differ for each person, and she's happy."],
      ["14-20s", "Smile at the camera", "Yours could be next. Link in my bio."],
    ], "Thank you [customer name] 💙 Order yours 👉 {link}", "#happycustomer #skincarenigeria #[city]skincare", "Ask first. Never say the product 'cured' anything."),

    S("Myth or fact?", "Reels, TikTok", "30 sec", [
      ["0-3s", "Look at the camera", "Myth or fact: you don't need sunscreen in Nigeria?"],
      ["3-15s", "Hold up a sunscreen", "Myth. The sun is strong all year, so sunscreen is for everyone."],
      ["15-24s", "Show applying it", "Apply it every morning, even when it's cloudy."],
      ["24-30s", "Hold up the product", "My sunscreen is [product], [₦price]. Link in my bio."],
    ], "Myth or fact? ☀️ Sunscreen every day. 👉 {link}", "#sunscreen #skincaremyths #skincarenigeria", "Do a series: one myth, one fact, every week."),

    S("Last pieces left", "WhatsApp Status", "20 sec", [
      ["0-3s", "Show the last few products", "Only [number] left of [product]."],
      ["3-14s", "Hold it up, show the price", "[Product]. Price: [₦price]."],
      ["14-20s", "Point at the camera", "Order now before it finishes. Link in my bio."],
    ], "Only [number] left of [product] ⏳ Order now 👉 {link}", "#lastpieces #skincarenigeria #[city]skincare", "Only post this when it's true. Customers remember."),
  ],
};