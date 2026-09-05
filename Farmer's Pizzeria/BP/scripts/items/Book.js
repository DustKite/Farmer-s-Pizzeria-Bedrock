var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { ActionFormData } from '@minecraft/server-ui';
import { ItemUseAfterEvent, world } from "@minecraft/server";
import { EventAPI } from '../lib/EventAPI';
import { kegRecipes } from '../datas/KegRcipes';

const BACK_BUTTON_ICON = "textures/ui/recap_glyph_color_2x";

function generateRecipeText(selection) {
    let result = { "rawtext": [] };
    if (!selection && selection !== 0)
        return result;
    const recipe = kegRecipes[selection];

    const baseFluid = recipe.basefluid ? [
        { translate: "brewinandchewin.book.recipe.base_fluid" },
        { translate: recipe.basefluid?.includes("minecraft") ? "item." + recipe.basefluid.split(":")[1] + ".name" : "item." + recipe.basefluid },
        { text: "\n" }
    ] : [];

    const time = [
        { translate: "brewinandchewin.book.recipe.time" },
        { translate: String(recipe.fermentingtime) },
        { text: "\n" }
    ];
    const temperature = [
        { translate: "brewinandchewin.book.recipe.temperature." + recipe.temperature },
        { text: "\n" }
    ];
    let ingredients = [{ translate: "brewinandchewin.book.recipe.ingredients" }, { text: "\n" }];
    recipe.ingredients.forEach(ingredient => {
        if (ingredient.item) {
            ingredients.push({ text: "§3—Item: §r" }, { translate: ingredient.item?.includes("minecraft") ? "item." + ingredient.item.split(":")[1] + ".name" : "item." + ingredient.item }, { text: "\n" });
        }
        if (ingredient.tag) {
            ingredients.push({ text: "§2—Tag: §r" }, { text: ingredient.tag }, { text: "\n" });
        }
    });
    const results = [
        { translate: "brewinandchewin.book.recipe.result" },
        { text: recipe.result.count + "x " },
        { translate: recipe.result.item?.includes("minecraft") ? "item." + recipe.result.item.split(":")[1] + ".name" : "item." + recipe.result.item },
    ];
    result.rawtext.push(...baseFluid, ...time, ...temperature, ...ingredients, ...results);
    return result;
}

function CropForm(player) {
    const form = new ActionFormData()
        .title({ "rawtext": [{ "text": "farmersdelight.book.crop" }] })
        .button({ "rawtext": [{ "text": "item.farmerspizzeria:basil_leaves" }] }, "textures/items/farmerspizzeria/basil_leaves")
        .button({ "rawtext": [{ "text": "farmerspizzeria.book.back" }] }, BACK_BUTTON_ICON);

    form.show(player).then((response) => {
        switch (response.selection) {
            case 0:
                BasilForm(player);
                break;
            case 1:
                mainForm(player);
                break;
        }
    });
}

function BasilForm(player) {
    const form = new ActionFormData()
        .title({ "rawtext": [{ "text": "item.farmerspizzeria:basil_leaves" }] })
        .body({
            "rawtext": [
                { "translate": "farmerspizzeria.book.basil_leaves.description" }
            ]
        })
        .button({ "rawtext": [{ "text": "farmerspizzeria.book.back" }] }, BACK_BUTTON_ICON);

    form.show(player).then((response) => {
        if (response.selection === 0) {
            CropForm(player);
        }
    });
}

function KegForm(player) {
    const form = new ActionFormData()
        .title({ "rawtext": [{ "text": "brewinandchewin.book.keg.title" }] })
        .button({ "rawtext": [{ "text": "item.farmerspizzeria:salami" }] }, "textures/items/farmerspizzeria/salami")
        .button({ "rawtext": [{ "text": "item.farmerspizzeria:unripe_dorblu_cheese_wheel" }] }, "textures/items/farmerspizzeria/unripe_dorblu_cheese_wheel")
        .button({ "rawtext": [{ "text": "farmerspizzeria.book.back" }] }, BACK_BUTTON_ICON);

    form.show(player).then((response) => {
        switch (response.selection) {
            case 0:
                SalamiForm(player);
                break;
            case 1:
                DorbluCheeseWheelForm(player);
                break;
            case 2:
                mainForm(player);
                break;
        }
    });
}

function SalamiForm(player) {
    const salamiRecipeIndex = kegRecipes.findIndex(r => r.result.item === "farmerspizzeria:salami");
    const form = new ActionFormData()
        .title({ "rawtext": [{ "text": "item.farmerspizzeria:salami" }] })
        .body(generateRecipeText(salamiRecipeIndex !== -1 ? salamiRecipeIndex : 0))
        .button({ "rawtext": [{ "text": "farmerspizzeria.book.back" }] }, BACK_BUTTON_ICON);

    form.show(player).then((response) => {
        if (response.selection === 0) {
            KegForm(player);
        }
    });
}

function DorbluCheeseWheelForm(player) {
    const dorbluRecipeIndex = kegRecipes.findIndex(r => r.result.item === "farmerspizzeria:unripe_dorblu_cheese_wheel");
    const form = new ActionFormData()
        .title({ "rawtext": [{ "text": "item.farmerspizzeria:unripe_dorblu_cheese_wheel" }] })
        .body(generateRecipeText(dorbluRecipeIndex !== -1 ? dorbluRecipeIndex : 1))
        .button({ "rawtext": [{ "text": "farmerspizzeria.book.back" }] }, BACK_BUTTON_ICON);

    form.show(player).then((response) => {
        if (response.selection === 0) {
            KegForm(player);
        }
    });
}

function PizzaForm(player) {
    const form = new ActionFormData()
        .title({ "rawtext": [{ "text": "farmerspizzeria.book.pizza" }] })
        .button({ "rawtext": [{ "text": "farmerspizzeria.book.pizza_process" }] }, "textures/items/farmerspizzeria/rolling_pin")
        .button({ "rawtext": [{ "text": "item.farmerspizzeria:carbonara_pizza" }] }, "textures/items/farmerspizzeria/carbonara_pizza")
        .button({ "rawtext": [{ "text": "item.farmerspizzeria:meat_feast_pizza" }] }, "textures/items/farmerspizzeria/meat_feast_pizza")
        .button({ "rawtext": [{ "text": "item.farmerspizzeria:pepperoni_pizza" }] }, "textures/items/farmerspizzeria/pepperoni_pizza")
        .button({ "rawtext": [{ "text": "item.farmerspizzeria:cheese_pizza" }] }, "textures/items/farmerspizzeria/cheese_pizza")
        .button({ "rawtext": [{ "text": "item.farmerspizzeria:margarita_pizza" }] }, "textures/items/farmerspizzeria/margarita_pizza")
        .button({ "rawtext": [{ "text": "farmerspizzeria.book.funghi_pizza" }] }, "textures/book/brewinandchewin/pizza")
        .button({ "rawtext": [{ "text": "farmerspizzeria.book.back" }] }, BACK_BUTTON_ICON);

    form.show(player).then((response) => {
        switch (response.selection) {
            case 0:
                PizzaProcessForm(player);
                break;
            case 1:
                CarbonaraPizzaForm(player);
                break;
            case 2:
                MeatFeastPizzaForm(player);
                break;
            case 3:
                PepperoniPizzaForm(player);
                break;
            case 4:
                CheesePizzaForm(player);
                break;
            case 5:
                MargaritaPizzaForm(player);
                break;
            case 6:
                FunghiPizzaForm(player);
                break;
            case 7:
                mainForm(player);
                break;
        }
    });
}

function PizzaProcessForm(player) {
    const form = new ActionFormData()
        .title({ "rawtext": [{ "text": "farmerspizzeria.book.pizza_process" }] })
        .body({
            "rawtext": [
                { "translate": "farmerspizzeria.book.pizza_process.description" }
            ]
        })
        .button({ "rawtext": [{ "text": "farmerspizzeria.book.back" }] }, BACK_BUTTON_ICON);

    form.show(player).then((response) => {
        if (response.selection === 0) {
            PizzaForm(player);
        }
    });
}

function CarbonaraPizzaForm(player) {
    const form = new ActionFormData()
        .title({ "rawtext": [{ "text": "item.farmerspizzeria:carbonara_pizza" }] })
        .body({
            "rawtext": [
                { "translate": "farmerspizzeria.book.carbonara_pizza.description" },
            ]
        })
        .button({ "rawtext": [{ "text": "farmerspizzeria.book.back" }] }, BACK_BUTTON_ICON);

    form.show(player).then((response) => {
        if (response.selection === 0) {
            PizzaForm(player);
        }
    });
}

function MeatFeastPizzaForm(player) {
    const form = new ActionFormData()
        .title({ "rawtext": [{ "text": "item.farmerspizzeria:meat_feast_pizza" }] })
        .body({
            "rawtext": [
                { "translate": "farmerspizzeria.book.meat_feast_pizza.description" }
            ]
        })
        .button({ "rawtext": [{ "text": "farmerspizzeria.book.back" }] }, BACK_BUTTON_ICON);

    form.show(player).then((response) => {
        if (response.selection === 0) {
            PizzaForm(player);
        }
    });
}

function PepperoniPizzaForm(player) {
    const form = new ActionFormData()
        .title({ "rawtext": [{ "text": "item.farmerspizzeria:pepperoni_pizza" }] })
        .body({
            "rawtext": [
                { "translate": "farmerspizzeria.book.pepperoni_pizza.description" }
            ]
        })
        .button({ "rawtext": [{ "text": "farmerspizzeria.book.back" }] }, BACK_BUTTON_ICON);

    form.show(player).then((response) => {
        if (response.selection === 0) {
            PizzaForm(player);
        }
    });
}

function CheesePizzaForm(player) {
    const form = new ActionFormData()
        .title({ "rawtext": [{ "text": "item.farmerspizzeria:cheese_pizza" }] })
        .body({
            "rawtext": [
                { "translate": "farmerspizzeria.book.cheese_pizza.description" }
            ]
        })
        .button({ "rawtext": [{ "text": "farmerspizzeria.book.back" }] }, BACK_BUTTON_ICON);

    form.show(player).then((response) => {
        if (response.selection === 0) {
            PizzaForm(player);
        }
    });
}

function MargaritaPizzaForm(player) {
    const form = new ActionFormData()
        .title({ "rawtext": [{ "text": "item.farmerspizzeria:margarita_pizza" }] })
        .body({
            "rawtext": [
                { "translate": "farmerspizzeria.book.margarita_pizza.description" }
            ]
        })
        .button({ "rawtext": [{ "text": "farmerspizzeria.book.back" }] }, BACK_BUTTON_ICON);

    form.show(player).then((response) => {
        if (response.selection === 0) {
            PizzaForm(player);
        }
    });
}

function FunghiPizzaForm(player) {
    const form = new ActionFormData()
        .title({ "rawtext": [{ "text": "farmerspizzeria.book.funghi_pizza" }] })
        .body({
            "rawtext": [
                { "translate": "farmerspizzeria.book.funghi_pizza.description" }
            ]
        })
        .button({ "rawtext": [{ "text": "farmerspizzeria.book.back" }] }, BACK_BUTTON_ICON);

    form.show(player).then((response) => {
        if (response.selection === 0) {
            PizzaForm(player);
        }
    });
}

function thanksForm(player) {
    const form = new ActionFormData()
        .title({ "rawtext": [{ "text": "farmerspizzeria.book.thanks" }] })
        .body({
            "rawtext": [
                { "translate": "farmerspizzeria.book.thanks.description" }
            ]
        })
        .button({ "rawtext": [{ "text": "farmerspizzeria.book.back" }] }, BACK_BUTTON_ICON);

    form.show(player).then((response) => {
        if (response.selection === 0) {
            mainForm(player);
        }
    });
}

function mainForm(player) {
    const form = new ActionFormData()
        .title({ "rawtext": [{ "text": "farmerspizzeria.book.pack" }] })
        .body({ "rawtext": [{ "translate": "farmerspizzeria.book.body" }] })
        .button({ "rawtext": [{ "text": "farmerspizzeria.book.pizza" }] }, "textures/items/farmerspizzeria/meat_feast_pizza_slice")
        .button({ "rawtext": [{ "text": "brewinandchewin.book.keg.title" }] }, "textures/book/brewinandchewin/keg")
        .button({ "rawtext": [{ "text": "farmersdelight.book.crop" }] }, "textures/items/farmerspizzeria/wild_basil")
        .button({ "rawtext": [{ "text": "farmerspizzeria.book.thanks" }] }, "textures/items/nether_star");

    form.show(player).then((response) => {
        switch (response.selection) {
            case 0:
                PizzaForm(player);
                break;
            case 1:
                KegForm(player);
                break;
            case 2:
                CropForm(player);
                break;
            case 3:
                thanksForm(player);
                break;
        }
    });
}

export class Book {
    itemUse(args) {
        const player = args.source;
        const itemStack = args.itemStack;
        if (itemStack?.typeId === "farmerspizzeria:book_farmerspizzeria") {
            mainForm(player);
        }
    }
}

__decorate([
    EventAPI.register(world.afterEvents.itemUse),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ItemUseAfterEvent]),
    __metadata("design:returntype", void 0)
], Book.prototype, "itemUse", null);