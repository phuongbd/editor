export const fakeValue = `<table class="order-po-number__container">
                        <tr>
                          <td class="order-number__cell">
                            <span class="order-number__text">
                              Order {{ order_name }}
                            </span>
                          </td>
                        </tr>
                        {%- if po_number %}
                            <tr>
                              <td class="po-number__cell">
                                <span class="po-number__text">
                                  PO number #{{ po_number }}
                                </span>
                              </td>
                            </tr>
                        {%- endif %}
                      </table>`