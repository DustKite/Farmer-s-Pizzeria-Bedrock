/**
 * from: 当前方块 ID
 * ingredient: 所需食材 ID（单个字符串或字符串数组）
 * to: 目标方块 ID
 * returns: 消耗食材后返还的物品
 */
export const PIZZA_RECIPES = [
    {
        from: "farmerspizzeria:dough",
        ingredient: "farmersdelight:tomato_sauce",
        to: "farmerspizzeria:dough_tomato_sauce",
        returns: "minecraft:bowl"
    },
    {
        from: "farmerspizzeria:dough_tomato_sauce",
        ingredient: "brewinandchewin:flaxen_cheese_wedge",
        to: "farmerspizzeria:dough_cheese"
    },
    {
        from: "farmerspizzeria:dough_cheese",
        ingredient: "farmersdelight:bacon",
        to: "farmerspizzeria:dough_bacon"
    },
    {
        from: "farmerspizzeria:dough_cheese",
        ingredient: "farmersdelight:tomato",
        to: "farmerspizzeria:dough_tomatoes"
    },
    {
        from: "farmerspizzeria:dough_cheese",
        ingredient: "farmerspizzeria:salami",
        to: "farmerspizzeria:raw_pepperoni_pizza"
    },
    {
        from: "farmerspizzeria:dough_cheese",
        ingredient: "brewinandchewin:scarlet_cheese_wedge",
        to: "farmerspizzeria:dough_two_cheeses"
    },
    {
        from: "farmerspizzeria:dough_cheese",
        ingredient: "farmerspizzeria:dorblu_cheese_wedge",
        to: "farmerspizzeria:dough_two_cheeses_2"
    },
    {
        from: "farmerspizzeria:dough_cheese",
        ingredient: "minecraft:brown_mushroom",
        to: "farmerspizzeria:dough_mushrooms"
    },
    {
        from: "farmerspizzeria:dough_cheese",
        ingredient: "minecraft:dried_kelp",
        to: "farmerspizzeria:dough_dried_kelp"
    },
    {
        from: "farmerspizzeria:dough_tomatoes",
        ingredient: "minecraft:brown_mushroom",
        to: "farmerspizzeria:dough_tomatoes_mushrooms"
    },
    {
        from: "farmerspizzeria:dough_tomatoes",
        ingredient: "farmerspizzeria:basil_leaves",
        to: "farmerspizzeria:raw_margarita_pizza"
    },
    {
        from: "farmerspizzeria:dough_tomatoes_mushrooms",
        ingredient: "farmerspizzeria:basil_leaves",
        to: "farmerspizzeria:raw_funghi_pizza"
    },
    {
        from: "farmerspizzeria:dough_two_cheeses",
        ingredient: "farmerspizzeria:dorblu_cheese_wedge",
        to: "farmerspizzeria:raw_cheese_pizza"
    },
    {
        from: "farmerspizzeria:dough_two_cheeses_2",
        ingredient: "brewinandchewin:scarlet_cheese_wedge",
        to: "farmerspizzeria:raw_cheese_pizza"
    },
    {
        from: "farmerspizzeria:dough_bacon",
        ingredient: "farmerspizzeria:salami",
        to: "farmerspizzeria:dough_bacon_pepperoni"
    },
    {
        from: "farmerspizzeria:dough_bacon",
        ingredient: "minecraft:egg",
        to: "farmerspizzeria:raw_carbonara_pizza"
    },
    {
        from: "farmerspizzeria:dough_bacon_pepperoni",
        ingredient: "farmersdelight:ham",
        to: "farmerspizzeria:raw_meat_feast_pizza"
    },
    {
        from: "farmerspizzeria:dough_dried_kelp",
        ingredient: "farmersdelight:salmon_slice",
        to: "farmerspizzeria:dough_dried_kelp_salmon"
    },
    {
        from: "farmerspizzeria:dough_dried_kelp",
        ingredient: "farmersdelight:cod_slice",
        to: "farmerspizzeria:dough_dried_kelp_cod"
    },
    {
        from: "farmerspizzeria:dough_dried_kelp_salmon",
        ingredient: "farmersdelight:cod_slice",
        to: "farmerspizzeria:raw_abyssal_marinara_pizza"
    },
    {
        from: "farmerspizzeria:dough_dried_kelp_cod",
        ingredient: "farmersdelight:salmon_slice",
        to: "farmerspizzeria:raw_abyssal_marinara_pizza"
    },
    {
        from: "farmerspizzeria:dough_mushrooms",
        ingredient: "farmersdelight:ham",
        to: "farmerspizzeria:raw_boscaiola_pizza"
    }
];

export const FORWARD_RECIPES = new Map();
export const REVERSE_RECIPES = new Map();

for (const recipe of PIZZA_RECIPES) {
    if (!FORWARD_RECIPES.has(recipe.from)) {
        FORWARD_RECIPES.set(recipe.from, new Map());
    }
    const ingredientMap = FORWARD_RECIPES.get(recipe.from);
    const ingredients = Array.isArray(recipe.ingredient) ? recipe.ingredient : [recipe.ingredient];

    for (const item of ingredients) {
        ingredientMap.set(item, {
            to: recipe.to,
            returns: recipe.returns || null
        });
    }

    if (!REVERSE_RECIPES.has(recipe.to)) {
        REVERSE_RECIPES.set(recipe.to, {
            prev: recipe.from,
            give: ingredients[0]
        });
    }
}