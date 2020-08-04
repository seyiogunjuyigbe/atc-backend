module.exports = {
    async calcPrice(product) {

    }
}
/*Product Price: £900
ATC free membership discounted price: £450
ATC membership discounted price: £300
Price calculation below (To be adjustable by the Admin User):
• Vendor price - x
• One-off membership fee = 21% of x
• Loyalty point allocation value = 6% of x
• Product trading value = 4% of x
• Product trading range value (0%, 1%, 2%, 3% to 4% - randomly of x)
• Product price = [x + Loyalty point allocation value (6% of x) + Product trading value (4% of x)] times 4
• ATC Product trading price = [x + Loyalty point allocation value (6% of x) + Product trading range value (0%, 1%, 2%, 3% to 4% - randomly of x)] times 4
• ATC free membership discounted price = Product price / 2 + Transaction fee (5%)
• ATC membership discounted price  = ATC Product trading price / 3 + Transaction fee (5%)
• Discount percentage off = % of ATC (as well as free) membership discounted product price (over) Product price
PCM (per calendar month) calculation is a division by 12.
product price.  =. vendor set adult price(x) + (6% of x) +  (4% of x) * 4
				(500 + 30 + 20) * 4 = 2200 product price */