const DEV_API_ENDPOINT = "https://fractional-quantities-app-production-copy--development.gadget.app/api/graphql";
const PROD_API_ENDPOINT = "https://fractional-quantities-app-production-copy.gadget.app/api/graphql";

// Dynamically determine API endpoint
const API_ENDPOINT =
  window.location.hostname.includes("development") ||
  window.location.hostname.includes("localhost")
    ? DEV_API_ENDPOINT
    : PROD_API_ENDPOINT;

async function fetchInventory(productId) {
  const query = `
    query GetProductInventory($id: ID!) {
        product(id: $id) {
          variants {
            id
            title
            inventoryQuantity
          }
          allow_fractions
          title
        }
      }
      `,
      { id: productId }
    );

    const { variants, allow_fractions } = response.data.product;
    const inventoryContainer = document.getElementById("inventory-container");

    variants.forEach((variant) => {
      const variantElement = document.createElement("div");
      variantElement.className = "quantity-selector";

      // Create a label for the variant
      const label = document.createElement("label");
      label.htmlFor = `quantity-${variant.id}`;
      label.textContent = `${variant.title}:`;
      variantElement.appendChild(label);

      // Create dropdown for whole quantities
      const wholeSelect = document.createElement("select");
      wholeSelect.id = `quantity-${variant.id}`;
      wholeSelect.name = `quantity-${variant.id}`;
      for (let i = 1; i <= Math.min(variant.inventoryQuantity, 10); i++) {
        const option = document.createElement("option");
        option.value = i;
        option.textContent = i;
        wholeSelect.appendChild(option);
      }
      variantElement.appendChild(wholeSelect);

      // Conditionally add fractional quantities
      if (allow_fractions) {
        const fractionLabel = document.createElement("span");
        fractionLabel.textContent = " (Fractional quantities)";
        fractionLabel.className = "fraction-label";
        variantElement.appendChild(fractionLabel);

        const fractionSelect = document.createElement("select");
        fractionSelect.id = `fraction-${variant.id}`;
        fractionSelect.name = `fraction-${variant.id}`;
        [0.25, 0.5, 0.75].forEach((fraction) => {
          const option = document.createElement("option");
          option.value = fraction;
          option.textContent = `+${fraction}`;
          fractionSelect.appendChild(option);
        });
        variantElement.appendChild(fractionSelect);
      }

      inventoryContainer.appendChild(variantElement);
    });
  } catch (error) {
    console.error("Error fetching inventory data:", error);
  }
});
