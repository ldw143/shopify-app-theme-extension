document.addEventListener("DOMContentLoaded", async () => {
  const inventoryContainer = document.getElementById("inventory-container");

  // Ensure the product ID is retrieved from the DOM
  const productId = inventoryContainer?.getAttribute("data-product-id");

  if (!productId) {
    console.error("Error: Missing product ID in inventory container.");
    inventoryContainer.textContent =
      "Unable to load inventory. Please contact support.";
    return;
  }

  // Dynamically determine environment
  const isDevelopment =
    window.location.hostname.includes("localhost") ||
    window.location.hostname.includes("development");

  const apiEndpoint = isDevelopment
    ? "https://your-dev-api.com/graphql"
    : "https://your-prod-api.com/graphql";

  const query = `
    query ($id: ID!) {
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
  `;

  async function fetchProductData(productId) {
    try {
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, variables: { id: productId } }),
      });
      const { data, errors } = await response.json();
      if (errors) {
        console.error("GraphQL query errors:", errors);
        return null;
      }
      return data?.product;
    } catch (error) {
      console.error("Error fetching product data:", error);
      return null;
    }
  }

  function renderDropdowns(product) {
    if (!product || !product.variants || product.variants.length === 0) {
      inventoryContainer.innerHTML = "<p>No availability.</p>";
      return;
    }

    inventoryContainer.innerHTML = `<h2>${product.title}</h2>`;
    product.variants.forEach((variant) => {
      const { id, title, inventoryQuantity, allow_fractions } = variant;

      const variantContainer = document.createElement("div");
      variantContainer.className = "variant-container";

      const variantTitle = document.createElement("h3");
      variantTitle.textContent = title;

      const wholeDropdown = document.createElement("select");
      wholeDropdown.className = "whole-dropdown";
      wholeDropdown.dataset.variantId = id;

      for (let i = 1; i <= inventoryQuantity; i++) {
        const option = document.createElement("option");
        option.value = i;
        option.textContent = i;
        wholeDropdown.appendChild(option);
      }

      variantContainer.appendChild(variantTitle);
      variantContainer.appendChild(wholeDropdown);

      if (allow_fractions) {
        const fractionDropdown = document.createElement("select");
        fractionDropdown.className = "fraction-dropdown";
        fractionDropdown.dataset.variantId = id;

        ["1/4", "1/2", "3/4"].forEach((fraction) => {
          const option = document.createElement("option");
          option.value = fraction;
          option.textContent = fraction;
          fractionDropdown.appendChild(option);
        });

        variantContainer.appendChild(fractionDropdown);
      }

      inventoryContainer.appendChild(variantContainer);
    });
  }

  try {
    const productData = await fetchProductData(productId);
    if (productData) {
      renderDropdowns(productData);
    } else {
      inventoryContainer.innerHTML = "<p>Failed to load product inventory.</p>";
    }
  } catch (error) {
    console.error("Failed to initialize block:", error);
  }
});