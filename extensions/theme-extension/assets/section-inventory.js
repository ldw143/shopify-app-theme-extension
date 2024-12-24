document.addEventListener("DOMContentLoaded", async () => {
  const inventoryContainer = document.getElementById("inventory-container");

  // Ensure the product ID is retrieved from the DOM
  const productId = inventoryContainer.dataset.productId;

  const blockSettings = inventoryContainer?.dataset; // Assuming settings are stored as data attributes
  console.log("Block is loading with these settings:", blockSettings);

  if (!productId) {
    console.error("Error: Missing product ID in inventory container.");
    inventoryContainer.textContent =
      "Unable to load inventory. Please contact support.";
    return;
  }

  // Determine the environment dynamically
  const isDevelopment = window.location.hostname.includes("localhost") || window.location.hostname.includes("development");
  const apiEndpoint = isDevelopment
    ? "https://fractional-quantities-app-production-copy--development.gadget.app/api/graphql"
    : "https://fractional-quantities-app-production-copy.gadget.app/api/graphql";

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
      `
    ;

   // Fetch product data from the API
  async function fetchProductData(productId) {
    try {
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query,
          variables: { id: productId },
        }),
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

  // Render dropdowns dynamically
  function renderDropdowns(product) {
    if (!product || !product.variants || product.variants.length === 0) {
      inventoryContainer.innerHTML = "<p>No availability.</p>";
      return;
    }

    const productTitle = product.title;
    const variants = product.variants;

    // Clear existing content
    inventoryContainer.innerHTML = `<h2>${productTitle}</h2>`;

    // Iterate through variants and create dropdowns
    variants.forEach((variant) => {
      const { id, title, inventoryQuantity, allow_fractions } = variant;

      // Create wrapper for the variant dropdowns
      const variantContainer = document.createElement("div");
      variantContainer.className = "variant-container";

      // Add variant title
      const variantTitle = document.createElement("h3");
      variantTitle.textContent = title;

      // Whole number dropdown
      const wholeDropdown = document.createElement("select");
      wholeDropdown.className = "whole-dropdown";
      wholeDropdown.setAttribute("data-variant-id", id);

      for (let i = 1; i <= inventoryQuantity; i++) {
        const option = document.createElement("option");
        option.value = i;
        option.textContent = i;
        wholeDropdown.appendChild(option);
      }

      // Append whole number dropdown
      variantContainer.appendChild(variantTitle);
      variantContainer.appendChild(wholeDropdown);

      // Conditional fractional dropdown
      if (allow_fractions) {
        const fractionDropdown = document.createElement("select");
        fractionDropdown.className = "fraction-dropdown";
        fractionDropdown.setAttribute("data-variant-id", id);

        ["1/4", "1/2", "3/4"].forEach((fraction) => {
          const option = document.createElement("option");
          option.value = fraction;
          option.textContent = fraction;
          fractionDropdown.appendChild(option);
        });

        // Append fractional dropdown
        variantContainer.appendChild(fractionDropdown);
      }

      // Append the variant container to the inventory container
      inventoryContainer.appendChild(variantContainer);
    });
  }

  // Main execution flow
  try {
    console.log("Fetching product data for ID:", productId);

  const productData = await fetchProductData(productId);
  if (productData) {

    console.log("Product data fetched successfully:", productData);
    
    renderDropdowns(productData);
  } else {
    inventoryContainer.innerHTML = "<p>Failed to load product inventory.</p>";
 
  }
} catch (error) {
  console.error("Failed to initialize block:", error);

  }
});
