/*
 * Copyright (c) 2023, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import {ApiClients, ApiMethod, Argument, CacheUpdateGetter, DataType, MergedOptions} from '../types'
import {useMutation} from '../useMutation'
import {UseMutationResult} from '@tanstack/react-query'
import useCommerceApi from '../useCommerceApi'
import {cacheUpdateMatrix} from './cache'

type Client = ApiClients['shopperBaskets']

/** Mutations available for Shopper Baskets. */
export const ShopperBasketsMutations = {
    /**
   * Creates a new basket.

The created basket is initialized with default values. Data provided in the body document is populated into the created basket. It can be updated with API endpoints listed below.

The taxMode query parameter can be used to choose the basket tax mode. The default is internal, in which case the tax calculation is done automatically based on internal tax tables. Alternatively, external taxation mode can be set which allows manual modification of the tax rates and values. External tax data is mandatory for product line items, option line items, shipping line items, coupon line items, and bonus discount line item. Gift certificate line items are optional and use zero tax rate per default, which can be overwritten. Price adjustments cannot be set because they are either calculated or inherited (depending on the type, the tax rate is either obtained from the related line item or computed as prorate of the basket).

API endpoints allowing further basket modification:

- customer information: PUT /baskets/\{basketId\}/customer

- billing address: PUT /baskets/\{basketId\}/billing-address

- shipments including shipping address and shipping method: POST /baskets/\{basketId\}/shipments

- product items: POST /baskets/\{basketId\}/items

- coupon items: POST /baskets/\{basketId\}/coupons

- gift certificate items: POST /baskets/\{basketId\}/gift-certificates

- basket taxation: PUT /baskets/\{basketId\}/taxes

- basket item taxation: PUT /baskets/\{basketId\}/items/\{itemId\}/taxes

- payment method and card type: POST /baskets/\{basketId\}/payment-instruments

- custom properties: PATCH /baskets/\{basketId\}

Related resource means with which resource you can specify the same data after the basket creation.
Identify the basket using the basketId property, which
should be integrated into the path of an update request (for example a POST to
/baskets/\{basketId\}/items).

A customer must provide a JSON Web Token (JWT), which specifies exactly one customer (it can be a guest or a registered
customer). In this case, the resource creates a basket for this customer.

The number of baskets which can be created per customer is limited. When a
basket is created, it is said to be open. It remains open until either an order is created from it
using a POST to resource /orders, or it is deleted using a DELETE to resource
/baskets/\{basketId\}. Each customer can have just one open basket.

Custom properties in the form c_\<CUSTOM_NAME\> are supported. A custom property must correspond to a custom
attribute (\<CUSTOM_NAME\>) defined for the basket system object, and its value must be valid for that custom
attribute.
   * @returns A TanStack Query mutation hook for interacting with the Shopper Baskets `createBasket` endpoint.
   * @see {@link https://developer.salesforce.com/docs/commerce/commerce-api/references/shopper-baskets?meta=createBasket| Salesforce Developer Center} for more information about the API endpoint.
   * @see {@link https://salesforcecommercecloud.github.io/commerce-sdk-isomorphic/classes/shopperbaskets.shopperbaskets-1.html#createbasket | `commerce-sdk-isomorphic` documentation} for more information on the parameters and returned data type.
   * @see {@link https://tanstack.com/query/latest/docs/react/reference/useMutation | TanStack Query `useMutation` reference} for more information about the return value.
   */
    CreateBasket: 'createBasket',
    /**
   * Transfer the previous shopper's basket to the current shopper by updating the basket's owner. No other values change. You must obtain the shopper authorization token via SLAS and you must provide the ‘guest usid‘ in both the ‘/oauth2/login‘ and ‘/oauth2/token‘ calls while fetching the registered user JWT token.

A success response contains the transferred basket.

If the current shopper has an active basket, and the `overrideExisting` request parameter is `false`, then the transfer request returns a BasketTransferException (HTTP status 409). You can proceed with one of these options:
- Keep the current shopper's active basket.
- Merge the previous and current shoppers' baskets by calling the `baskets/merge` endpoint.
- Force the transfer by calling the `baskets/transfer` endpoint again, with the parameter `overrideExisting=true`. Forcing the transfer deletes the current shopper's active basket.
   * @returns A TanStack Query mutation hook for interacting with the Shopper Baskets `transferBasket` endpoint.
   * @see {@link https://developer.salesforce.com/docs/commerce/commerce-api/references/shopper-baskets?meta=transferBasket| Salesforce Developer Center} for more information about the API endpoint.
   * @see {@link https://salesforcecommercecloud.github.io/commerce-sdk-isomorphic/classes/shopperbaskets.shopperbaskets-1.html#transferbasket | `commerce-sdk-isomorphic` documentation} for more information on the parameters and returned data type.
   * @see {@link https://tanstack.com/query/latest/docs/react/reference/useMutation | TanStack Query `useMutation` reference} for more information about the return value.
   */
    TransferBasket: 'transferBasket',
    /**
   * Merge data from the previous shopper's basket into the current shopper's active basket and delete the previous shopper's basket. This endpoint doesn't merge Personally Identifiable Information (PII). You must obtain the shopper authorization token via SLAS and you must provide the ‘guest usid‘ in both the ‘/oauth2/login‘ and ‘/oauth2/token‘ calls while fetching the registered user JWT token. After the merge, all basket amounts are recalculated and totaled, including lookups for prices, taxes, shipping, and promotions.

The following information is merged:
- custom attributes on the basket and on all copied records
- product items
- gift certificate items
- coupon items
- shipments
- ad-hoc price adjustments

To control the merging of products that exist in both baskets, use the `productItemMergeMode` parameter. By default, the higher of the two basket quantities is used for each product. Products in both baskets are considered to be the same when all of the following values match (if one product doesn't have a value, the other product is a match only if it also doesn't have that value):
- shipment
- productId
- option values
- wishlist reference
- inventory list id
- gift flag & message
- ad-hoc price adjustments

If any of the listed values don't match, then the item in the previous shopper's basket is copied to a new line item in the current shopper's basket. If the listed values all match, but the matching products have different values for any custom attribute, the merged line item keeps the custom attribute value from the current shopper's basket.

A success response contains the current shopper's active basket. The previous guest shopper's active basket is deleted.

If the current shopper doesn't have an active basket, and the createDestinationBasket request parameter is false, then the merge request returns a BasketMergeException (HTTP status 409). You can proceed with one of these options:
- Transfer the previous shopper's active basket to the current logged-in shopper by calling the `baskets/transfer` endpoint.
- Force the merge by calling the `baskets/merge` endpoint again, with the parameter `createDestinationBasket=true`. Forcing the merge creates a new basket for the current shopper and copies information from the previous shopper's basket into it. Because the merge doesn't copy all basket data, a forced merge is not the same as a transfer. For example, the new basket doesn't contain any Personally Identifiable Information (PII) from the previous basket.

### before merge
| Previous Shopper's Basket, SKU: Quantity, Custom Attributes | Current Shopper's Basket, SKU: Quantity, Custom Attributes  |
|-------------------------------------------------------------|-------------------------------------------------------------|
| SKU_A: 5\<br\> SKU_B: 3\<br\> SKU_C: 4\<br\> c_customAttr_1: 'ABC' \<br\> c_customAttr_2: 'DEF'   | SKU_A: 2\<br\> SKU_D: 6\<br\> SKU_E: 7\<br\> c_customAttr_1: 'UVW' \<br\> c_customAttr_3: 'XYZ'   |

### after merge - (previous shopper's basket is deleted)
| productItemMergeMode | Current Shopper's Basket - SKU: Quantity, Custom Attributes  |
|----------------------|--------------------------------------------------------------|
| sum_quantities         | SKU_A: 7\<br\> SKU_B: 3\<br\> SKU_C: 4\<br\> SKU_D: 6\<br\> SKU_E: 7\<br\> c_customAttr_1: 'UVW' \<br\> c_customAttr_2: 'DEF' \<br\> c_customAttr_3: 'XYZ'              |
| higher_quantity      | SKU_A: 5\<br\> SKU_B: 3\<br\> SKU_C: 4\<br\> SKU_D: 6\<br\> SKU_E: 7\<br\> c_customAttr_1: 'UVW' \<br\> c_customAttr_2: 'DEF' \<br\> c_customAttr_3: 'XYZ'              |
| saved_quantity       | SKU_A: 2\<br\> SKU_B: 3\<br\> SKU_C: 4\<br\> SKU_D: 6\<br\> SKU_E: 7\<br\> c_customAttr_1: 'UVW' \<br\> c_customAttr_2: 'DEF' \<br\> c_customAttr_3: 'XYZ'              |
| separate_item        | SKU_A: 5\<br\> SKU_B: 3\<br\> SKU_C: 4\<br\> SKU_A: 2\<br\> SKU_D: 6\<br\> SKU_E: 7\<br\> c_customAttr_1: 'UVW' \<br\> c_customAttr_2: 'DEF' \<br\> c_customAttr_3: 'XYZ' |
   * @returns A TanStack Query mutation hook for interacting with the Shopper Baskets `mergeBasket` endpoint.
   * @see {@link https://developer.salesforce.com/docs/commerce/commerce-api/references/shopper-baskets?meta=mergeBasket| Salesforce Developer Center} for more information about the API endpoint.
   * @see {@link https://salesforcecommercecloud.github.io/commerce-sdk-isomorphic/classes/shopperbaskets.shopperbaskets-1.html#mergebasket | `commerce-sdk-isomorphic` documentation} for more information on the parameters and returned data type.
   * @see {@link https://tanstack.com/query/latest/docs/react/reference/useMutation | TanStack Query `useMutation` reference} for more information about the return value.
   */
    MergeBasket: 'mergeBasket',
    /**
     * Removes a basket.
     * @returns A TanStack Query mutation hook for interacting with the Shopper Baskets `deleteBasket` endpoint.
     * @see {@link https://developer.salesforce.com/docs/commerce/commerce-api/references/shopper-baskets?meta=deleteBasket| Salesforce Developer Center} for more information about the API endpoint.
     * @see {@link https://salesforcecommercecloud.github.io/commerce-sdk-isomorphic/classes/shopperbaskets.shopperbaskets-1.html#deletebasket | `commerce-sdk-isomorphic` documentation} for more information on the parameters and returned data type.
     * @see {@link https://tanstack.com/query/latest/docs/react/reference/useMutation | TanStack Query `useMutation` reference} for more information about the return value.
     */
    DeleteBasket: 'deleteBasket',
    /**
   * Updates a basket. Only the currency of the basket, source code, the custom
properties of the basket, and the shipping items will be considered.
   * @returns A TanStack Query mutation hook for interacting with the Shopper Baskets `updateBasket` endpoint.
   * @see {@link https://developer.salesforce.com/docs/commerce/commerce-api/references/shopper-baskets?meta=updateBasket| Salesforce Developer Center} for more information about the API endpoint.
   * @see {@link https://salesforcecommercecloud.github.io/commerce-sdk-isomorphic/classes/shopperbaskets.shopperbaskets-1.html#updatebasket | `commerce-sdk-isomorphic` documentation} for more information on the parameters and returned data type.
   * @see {@link https://tanstack.com/query/latest/docs/react/reference/useMutation | TanStack Query `useMutation` reference} for more information about the return value.
   */
    UpdateBasket: 'updateBasket',
    /**
     * Sets the billing address of a basket.
     * @returns A TanStack Query mutation hook for interacting with the Shopper Baskets `updateBillingAddressForBasket` endpoint.
     * @see {@link https://developer.salesforce.com/docs/commerce/commerce-api/references/shopper-baskets?meta=updateBillingAddressForBasket| Salesforce Developer Center} for more information about the API endpoint.
     * @see {@link https://salesforcecommercecloud.github.io/commerce-sdk-isomorphic/classes/shopperbaskets.shopperbaskets-1.html#updatebillingaddressforbasket | `commerce-sdk-isomorphic` documentation} for more information on the parameters and returned data type.
     * @see {@link https://tanstack.com/query/latest/docs/react/reference/useMutation | TanStack Query `useMutation` reference} for more information about the return value.
     */
    UpdateBillingAddressForBasket: 'updateBillingAddressForBasket',
    /**
     * Adds a coupon to an existing basket.
     * @returns A TanStack Query mutation hook for interacting with the Shopper Baskets `addCouponToBasket` endpoint.
     * @see {@link https://developer.salesforce.com/docs/commerce/commerce-api/references/shopper-baskets?meta=addCouponToBasket| Salesforce Developer Center} for more information about the API endpoint.
     * @see {@link https://salesforcecommercecloud.github.io/commerce-sdk-isomorphic/classes/shopperbaskets.shopperbaskets-1.html#addcoupontobasket | `commerce-sdk-isomorphic` documentation} for more information on the parameters and returned data type.
     * @see {@link https://tanstack.com/query/latest/docs/react/reference/useMutation | TanStack Query `useMutation` reference} for more information about the return value.
     */
    AddCouponToBasket: 'addCouponToBasket',
    /**
     * Removes a coupon from the basket.
     * @returns A TanStack Query mutation hook for interacting with the Shopper Baskets `removeCouponFromBasket` endpoint.
     * @see {@link https://developer.salesforce.com/docs/commerce/commerce-api/references/shopper-baskets?meta=removeCouponFromBasket| Salesforce Developer Center} for more information about the API endpoint.
     * @see {@link https://salesforcecommercecloud.github.io/commerce-sdk-isomorphic/classes/shopperbaskets.shopperbaskets-1.html#removecouponfrombasket | `commerce-sdk-isomorphic` documentation} for more information on the parameters and returned data type.
     * @see {@link https://tanstack.com/query/latest/docs/react/reference/useMutation | TanStack Query `useMutation` reference} for more information about the return value.
     */
    RemoveCouponFromBasket: 'removeCouponFromBasket',
    /**
     * Sets customer information for an existing basket.
     * @returns A TanStack Query mutation hook for interacting with the Shopper Baskets `updateCustomerForBasket` endpoint.
     * @see {@link https://developer.salesforce.com/docs/commerce/commerce-api/references/shopper-baskets?meta=updateCustomerForBasket| Salesforce Developer Center} for more information about the API endpoint.
     * @see {@link https://salesforcecommercecloud.github.io/commerce-sdk-isomorphic/classes/shopperbaskets.shopperbaskets-1.html#updatecustomerforbasket | `commerce-sdk-isomorphic` documentation} for more information on the parameters and returned data type.
     * @see {@link https://tanstack.com/query/latest/docs/react/reference/useMutation | TanStack Query `useMutation` reference} for more information about the return value.
     */
    UpdateCustomerForBasket: 'updateCustomerForBasket',
    /**
     * Adds a gift certificate item to an existing basket.
     * @returns A TanStack Query mutation hook for interacting with the Shopper Baskets `addGiftCertificateItemToBasket` endpoint.
     * @see {@link https://developer.salesforce.com/docs/commerce/commerce-api/references/shopper-baskets?meta=addGiftCertificateItemToBasket| Salesforce Developer Center} for more information about the API endpoint.
     * @see {@link https://salesforcecommercecloud.github.io/commerce-sdk-isomorphic/classes/shopperbaskets.shopperbaskets-1.html#addgiftcertificateitemtobasket | `commerce-sdk-isomorphic` documentation} for more information on the parameters and returned data type.
     * @see {@link https://tanstack.com/query/latest/docs/react/reference/useMutation | TanStack Query `useMutation` reference} for more information about the return value.
     */
    AddGiftCertificateItemToBasket: 'addGiftCertificateItemToBasket',
    /**
     * Deletes a gift certificate item from an existing basket.
     * @returns A TanStack Query mutation hook for interacting with the Shopper Baskets `removeGiftCertificateItemFromBasket` endpoint.
     * @see {@link https://developer.salesforce.com/docs/commerce/commerce-api/references/shopper-baskets?meta=removeGiftCertificateItemFromBasket| Salesforce Developer Center} for more information about the API endpoint.
     * @see {@link https://salesforcecommercecloud.github.io/commerce-sdk-isomorphic/classes/shopperbaskets.shopperbaskets-1.html#removegiftcertificateitemfrombasket | `commerce-sdk-isomorphic` documentation} for more information on the parameters and returned data type.
     * @see {@link https://tanstack.com/query/latest/docs/react/reference/useMutation | TanStack Query `useMutation` reference} for more information about the return value.
     */
    RemoveGiftCertificateItemFromBasket: 'removeGiftCertificateItemFromBasket',
    /**
     * Updates a gift certificate item of an existing basket.
     * @returns A TanStack Query mutation hook for interacting with the Shopper Baskets `updateGiftCertificateItemInBasket` endpoint.
     * @see {@link https://developer.salesforce.com/docs/commerce/commerce-api/references/shopper-baskets?meta=updateGiftCertificateItemInBasket| Salesforce Developer Center} for more information about the API endpoint.
     * @see {@link https://salesforcecommercecloud.github.io/commerce-sdk-isomorphic/classes/shopperbaskets.shopperbaskets-1.html#updategiftcertificateiteminbasket | `commerce-sdk-isomorphic` documentation} for more information on the parameters and returned data type.
     * @see {@link https://tanstack.com/query/latest/docs/react/reference/useMutation | TanStack Query `useMutation` reference} for more information about the return value.
     */
    UpdateGiftCertificateItemInBasket: 'updateGiftCertificateItemInBasket',
    /**
   * Adds new items to a basket. The added items are associated with the
specified shipment. If no shipment id is specified, the added items are associated with the default shipment.
Considered values from the request body, for each item are:

- productId: a valid product ID. This is the ID of the product to be added to the basket. If the
product is already in the basket, the API either increments the quantity of the existing product line item or
creates a new product line item, based on the site preference 'Add Product Behavior'. For option products and
product bundles containing variation masters, the API creates a new product line item regardless of the site
preference.
- shipmentId: a valid shipment ID (optional). This is the ID of the shipment in which the product item
is created.
- quantity: a number between 0.01 and 999. This is the quantity of the product to order.
- inventoryId: a valid inventory ID (optional). This is the ID of the inventory from which the item is
allocated.
- bonusDiscountLineItemId: a valid bonus discount line item ID (optional). This is the ID of the
bonus discount line item for which the added product is a selected bonus product.
- optionItems/optionValueId: a valid option value ID. This is an option value for an option item of
an option product.  This is only possible if the product item is an option
product. To set option values, you must specify a collection of option items in the optionItems
property. These option items must contain optionId and optionValueId. Also,
the values you specify must be valid for the option product that this product item represents. Otherwise, the
server throws an InvalidProductOptionItemException or an
InvalidProductOptionValueItemException.
- custom properties in the form c_\<CUSTOM_NAME\>: the custom property must correspond to a custom
attribute (\<CUSTOM_NAME\>) defined for ProductLineItem. The value of this property must be valid for the
type of custom attribute defined for ProductLineItem.
   * @returns A TanStack Query mutation hook for interacting with the Shopper Baskets `addItemToBasket` endpoint.
   * @see {@link https://developer.salesforce.com/docs/commerce/commerce-api/references/shopper-baskets?meta=addItemToBasket| Salesforce Developer Center} for more information about the API endpoint.
   * @see {@link https://salesforcecommercecloud.github.io/commerce-sdk-isomorphic/classes/shopperbaskets.shopperbaskets-1.html#additemtobasket | `commerce-sdk-isomorphic` documentation} for more information on the parameters and returned data type.
   * @see {@link https://tanstack.com/query/latest/docs/react/reference/useMutation | TanStack Query `useMutation` reference} for more information about the return value.
   */
    AddItemToBasket: 'addItemToBasket',
    /**
     * Removes a product item from the basket.
     * @returns A TanStack Query mutation hook for interacting with the Shopper Baskets `removeItemFromBasket` endpoint.
     * @see {@link https://developer.salesforce.com/docs/commerce/commerce-api/references/shopper-baskets?meta=removeItemFromBasket| Salesforce Developer Center} for more information about the API endpoint.
     * @see {@link https://salesforcecommercecloud.github.io/commerce-sdk-isomorphic/classes/shopperbaskets.shopperbaskets-1.html#removeitemfrombasket | `commerce-sdk-isomorphic` documentation} for more information on the parameters and returned data type.
     * @see {@link https://tanstack.com/query/latest/docs/react/reference/useMutation | TanStack Query `useMutation` reference} for more information about the return value.
     */
    RemoveItemFromBasket: 'removeItemFromBasket',
    /**
   * Updates an item in a basket. The
following values in the request body are considered by the server:

- productId: a valid product ID. The purpose of this
value is to exchange a variation of a variation product.
- shipmentId: a valid shipment ID. The purpose of
this value is to move a product item to another shipment.
- quantity: a number between 0 and 999. The purpose of
this value is to change quantity of the product item. If quantity is 0,
the product item is removed.
- optionItems/optionValueId: a valid option value
ID. The purpose of this value is to exchange an option value for an
option item of an option product.
This is only possible if the product item is an option product. To change
option values a collection of option items to be changed need to be
provided in property optionItems. Those
optionItems need to contain optionId
and optionValueId. The provided values must be valid
for the option product that this product item represents. Otherwise
InvalidProductOptionItemException or
InvalidProductOptionValueItemException will be thrown.
custom properties c_\<CUSTOM_NAME\>: a
value corresponding to the type defined for custom attribute
\<CUSTOM_NAME\> of ProductLineItem. The purpose of this value is to
add or change the value of a custom attribute defined for
ProductLineItem.
   * @returns A TanStack Query mutation hook for interacting with the Shopper Baskets `updateItemInBasket` endpoint.
   * @see {@link https://developer.salesforce.com/docs/commerce/commerce-api/references/shopper-baskets?meta=updateItemInBasket| Salesforce Developer Center} for more information about the API endpoint.
   * @see {@link https://salesforcecommercecloud.github.io/commerce-sdk-isomorphic/classes/shopperbaskets.shopperbaskets-1.html#updateiteminbasket | `commerce-sdk-isomorphic` documentation} for more information on the parameters and returned data type.
   * @see {@link https://tanstack.com/query/latest/docs/react/reference/useMutation | TanStack Query `useMutation` reference} for more information about the return value.
   */
    UpdateItemInBasket: 'updateItemInBasket',
    /**
     * This method allows you to apply external taxation data to an existing basket to be able to pass tax rates and optional values for a specific taxable line item. This endpoint can be called only if external taxation mode was used for basket creation. See POST /baskets for more information.
     * @returns A TanStack Query mutation hook for interacting with the Shopper Baskets `addTaxesForBasketItem` endpoint.
     * @see {@link https://developer.salesforce.com/docs/commerce/commerce-api/references/shopper-baskets?meta=addTaxesForBasketItem| Salesforce Developer Center} for more information about the API endpoint.
     * @see {@link https://salesforcecommercecloud.github.io/commerce-sdk-isomorphic/classes/shopperbaskets.shopperbaskets-1.html#addtaxesforbasketitem | `commerce-sdk-isomorphic` documentation} for more information on the parameters and returned data type.
     * @see {@link https://tanstack.com/query/latest/docs/react/reference/useMutation | TanStack Query `useMutation` reference} for more information about the return value.
     */
    AddTaxesForBasketItem: 'addTaxesForBasketItem',
    /**
     * Adds a payment instrument to a basket.
     * @returns A TanStack Query mutation hook for interacting with the Shopper Baskets `addPaymentInstrumentToBasket` endpoint.
     * @see {@link https://developer.salesforce.com/docs/commerce/commerce-api/references/shopper-baskets?meta=addPaymentInstrumentToBasket| Salesforce Developer Center} for more information about the API endpoint.
     * @see {@link https://salesforcecommercecloud.github.io/commerce-sdk-isomorphic/classes/shopperbaskets.shopperbaskets-1.html#addpaymentinstrumenttobasket | `commerce-sdk-isomorphic` documentation} for more information on the parameters and returned data type.
     * @see {@link https://tanstack.com/query/latest/docs/react/reference/useMutation | TanStack Query `useMutation` reference} for more information about the return value.
     */
    AddPaymentInstrumentToBasket: 'addPaymentInstrumentToBasket',
    /**
     * Removes a payment instrument of a basket.
     * @returns A TanStack Query mutation hook for interacting with the Shopper Baskets `removePaymentInstrumentFromBasket` endpoint.
     * @see {@link https://developer.salesforce.com/docs/commerce/commerce-api/references/shopper-baskets?meta=removePaymentInstrumentFromBasket| Salesforce Developer Center} for more information about the API endpoint.
     * @see {@link https://salesforcecommercecloud.github.io/commerce-sdk-isomorphic/classes/shopperbaskets.shopperbaskets-1.html#removepaymentinstrumentfrombasket | `commerce-sdk-isomorphic` documentation} for more information on the parameters and returned data type.
     * @see {@link https://tanstack.com/query/latest/docs/react/reference/useMutation | TanStack Query `useMutation` reference} for more information about the return value.
     */
    RemovePaymentInstrumentFromBasket: 'removePaymentInstrumentFromBasket',
    /**
     * Updates payment instrument of an existing basket.
     * @returns A TanStack Query mutation hook for interacting with the Shopper Baskets `updatePaymentInstrumentInBasket` endpoint.
     * @see {@link https://developer.salesforce.com/docs/commerce/commerce-api/references/shopper-baskets?meta=updatePaymentInstrumentInBasket| Salesforce Developer Center} for more information about the API endpoint.
     * @see {@link https://salesforcecommercecloud.github.io/commerce-sdk-isomorphic/classes/shopperbaskets.shopperbaskets-1.html#updatepaymentinstrumentinbasket | `commerce-sdk-isomorphic` documentation} for more information on the parameters and returned data type.
     * @see {@link https://tanstack.com/query/latest/docs/react/reference/useMutation | TanStack Query `useMutation` reference} for more information about the return value.
     */
    UpdatePaymentInstrumentInBasket: 'updatePaymentInstrumentInBasket',
    /**
     * This method allows you to put an array of priceBookIds to an existing basket, which will be used for basket calculation.
     * @returns A TanStack Query mutation hook for interacting with the Shopper Baskets `addPriceBooksToBasket` endpoint.
     * @see {@link https://developer.salesforce.com/docs/commerce/commerce-api/references/shopper-baskets?meta=addPriceBooksToBasket| Salesforce Developer Center} for more information about the API endpoint.
     * @see {@link https://salesforcecommercecloud.github.io/commerce-sdk-isomorphic/classes/shopperbaskets.shopperbaskets-1.html#addpricebookstobasket | `commerce-sdk-isomorphic` documentation} for more information on the parameters and returned data type.
     * @see {@link https://tanstack.com/query/latest/docs/react/reference/useMutation | TanStack Query `useMutation` reference} for more information about the return value.
     */
    AddPriceBooksToBasket: 'addPriceBooksToBasket',
    /**
   * Creates a new shipment for a basket.

The created shipment is initialized with values provided in the body
document and can be updated with further data API calls. Considered from
the body are the following properties if specified:

- the ID
- the shipping address
- the shipping method
- gift boolean flag
- gift message
- custom properties
   * @returns A TanStack Query mutation hook for interacting with the Shopper Baskets `createShipmentForBasket` endpoint.
   * @see {@link https://developer.salesforce.com/docs/commerce/commerce-api/references/shopper-baskets?meta=createShipmentForBasket| Salesforce Developer Center} for more information about the API endpoint.
   * @see {@link https://salesforcecommercecloud.github.io/commerce-sdk-isomorphic/classes/shopperbaskets.shopperbaskets-1.html#createshipmentforbasket | `commerce-sdk-isomorphic` documentation} for more information on the parameters and returned data type.
   * @see {@link https://tanstack.com/query/latest/docs/react/reference/useMutation | TanStack Query `useMutation` reference} for more information about the return value.
   */
    CreateShipmentForBasket: 'createShipmentForBasket',
    /**
   * Removes a specified shipment and all associated product, gift certificate,
shipping, and price adjustment line items from a basket.
It is not allowed to remove the default shipment.
   * @returns A TanStack Query mutation hook for interacting with the Shopper Baskets `removeShipmentFromBasket` endpoint.
   * @see {@link https://developer.salesforce.com/docs/commerce/commerce-api/references/shopper-baskets?meta=removeShipmentFromBasket| Salesforce Developer Center} for more information about the API endpoint.
   * @see {@link https://salesforcecommercecloud.github.io/commerce-sdk-isomorphic/classes/shopperbaskets.shopperbaskets-1.html#removeshipmentfrombasket | `commerce-sdk-isomorphic` documentation} for more information on the parameters and returned data type.
   * @see {@link https://tanstack.com/query/latest/docs/react/reference/useMutation | TanStack Query `useMutation` reference} for more information about the return value.
   */
    RemoveShipmentFromBasket: 'removeShipmentFromBasket',
    /**
   * Updates a shipment for a basket.

The shipment is initialized with values provided in the body
document and can be updated with further data API calls. Considered from
the body are the following properties if specified:
- the ID
- the shipping address
- the shipping method
- gift boolean flag
- gift message
- custom properties
   * @returns A TanStack Query mutation hook for interacting with the Shopper Baskets `updateShipmentForBasket` endpoint.
   * @see {@link https://developer.salesforce.com/docs/commerce/commerce-api/references/shopper-baskets?meta=updateShipmentForBasket| Salesforce Developer Center} for more information about the API endpoint.
   * @see {@link https://salesforcecommercecloud.github.io/commerce-sdk-isomorphic/classes/shopperbaskets.shopperbaskets-1.html#updateshipmentforbasket | `commerce-sdk-isomorphic` documentation} for more information on the parameters and returned data type.
   * @see {@link https://tanstack.com/query/latest/docs/react/reference/useMutation | TanStack Query `useMutation` reference} for more information about the return value.
   */
    UpdateShipmentForBasket: 'updateShipmentForBasket',
    /**
     * Sets a shipping address of a specific shipment of a basket.
     * @returns A TanStack Query mutation hook for interacting with the Shopper Baskets `updateShippingAddressForShipment` endpoint.
     * @see {@link https://developer.salesforce.com/docs/commerce/commerce-api/references/shopper-baskets?meta=updateShippingAddressForShipment| Salesforce Developer Center} for more information about the API endpoint.
     * @see {@link https://salesforcecommercecloud.github.io/commerce-sdk-isomorphic/classes/shopperbaskets.shopperbaskets-1.html#updateshippingaddressforshipment | `commerce-sdk-isomorphic` documentation} for more information on the parameters and returned data type.
     * @see {@link https://tanstack.com/query/latest/docs/react/reference/useMutation | TanStack Query `useMutation` reference} for more information about the return value.
     */
    UpdateShippingAddressForShipment: 'updateShippingAddressForShipment',
    /**
     * Sets a shipping method to a specific shipment of a basket.
     * @returns A TanStack Query mutation hook for interacting with the Shopper Baskets `updateShippingMethodForShipment` endpoint.
     * @see {@link https://developer.salesforce.com/docs/commerce/commerce-api/references/shopper-baskets?meta=updateShippingMethodForShipment| Salesforce Developer Center} for more information about the API endpoint.
     * @see {@link https://salesforcecommercecloud.github.io/commerce-sdk-isomorphic/classes/shopperbaskets.shopperbaskets-1.html#updateshippingmethodforshipment | `commerce-sdk-isomorphic` documentation} for more information on the parameters and returned data type.
     * @see {@link https://tanstack.com/query/latest/docs/react/reference/useMutation | TanStack Query `useMutation` reference} for more information about the return value.
     */
    UpdateShippingMethodForShipment: 'updateShippingMethodForShipment',
    /**
     * This method allows you to apply external taxation data to an existing basket to be able to pass tax rates and optional values for all taxable line items. This endpoint can be called only if external taxation mode was used for basket creation. See POST /baskets for more information.
     * @returns A TanStack Query mutation hook for interacting with the Shopper Baskets `addTaxesForBasket` endpoint.
     * @see {@link https://developer.salesforce.com/docs/commerce/commerce-api/references/shopper-baskets?meta=addTaxesForBasket| Salesforce Developer Center} for more information about the API endpoint.
     * @see {@link https://salesforcecommercecloud.github.io/commerce-sdk-isomorphic/classes/shopperbaskets.shopperbaskets-1.html#addtaxesforbasket | `commerce-sdk-isomorphic` documentation} for more information on the parameters and returned data type.
     * @see {@link https://tanstack.com/query/latest/docs/react/reference/useMutation | TanStack Query `useMutation` reference} for more information about the return value.
     */
    AddTaxesForBasket: 'addTaxesForBasket'
} as const

/** Mutation for Shopper Baskets. */
export type ShopperBasketsMutation =
    (typeof ShopperBasketsMutations)[keyof typeof ShopperBasketsMutations]

export function useShopperBasketsMutation<Mutation extends ShopperBasketsMutation>(
    mutation: Mutation
): UseMutationResult<DataType<Client[Mutation]>, unknown, Argument<Client[Mutation]>> {
    const getCacheUpdates = cacheUpdateMatrix[mutation]

    // The `Options` and `Data` types for each mutation are similar, but distinct, and the union
    // type generated from `Client[Mutation]` seems to be too complex for TypeScript to handle.
    // I'm not sure if there's a way to avoid the type assertions in here for the methods that
    // use them. However, I'm fairly confident that they are safe to do, as they seem to be simply
    // re-asserting what we already have.
    const {shopperBaskets: client} = useCommerceApi()
    type Options = Argument<Client[Mutation]>
    type Data = DataType<Client[Mutation]>
    return useMutation({
        client,
        method: (opts: Options) => (client[mutation] as ApiMethod<Options, Data>)(opts),
        getCacheUpdates: getCacheUpdates as CacheUpdateGetter<MergedOptions<Client, Options>, Data>
    })
}
