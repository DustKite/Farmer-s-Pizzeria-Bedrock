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
import { kegRecipes } from './KegRcipes';

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

function kegRecipeFrom(player, selection) {
    if (!selection && selection !== 0)
        return;
    const form = new ActionFormData()
        .title({ "rawtext": [{ text: "item." + kegRecipes[selection].result.item }] })
        .body(generateRecipeText(selection))
        .button({ "rawtext": [{ text: "brewinandchewin.book.back" }] }, BACK_BUTTON_ICON);

    form.show(player).then((response) => {
        recipeListForm(player);
    });
}

function recipeListForm(player) {
    const form = new ActionFormData()
        .title({ "rawtext": [{ text: "brewinandchewin.book.recipe.title" }] });

    for (let i = 0; i < kegRecipes.length; i++) {
        form.button({ "rawtext": [{ text: "item." + kegRecipes[i].result.item }] }, "textures/items/" + kegRecipes[i].result.item.replace("brewinandchewin:", ""));
    }
    form.button({ "rawtext": [{ text: "brewinandchewin.book.back" }] }, BACK_BUTTON_ICON);

    form.show(player).then((response) => {
        if (response.selection === kegRecipes.length || response.selection === undefined) {
            mainForm(player);
        } else {
            kegRecipeFrom(player, response.selection);
        }
    });
}

function kegForm(player) {
    const form = new ActionFormData()
        .title({ "rawtext": [{ text: "brewinandchewin.book.keg.title" }] })
        .body({
            "rawtext": [
                { text: "brewinandchewin.book.keg.body" }
            ]
        })
        .button({ "rawtext": [{ text: "brewinandchewin.book.back" }] }, BACK_BUTTON_ICON);

    form.show(player).then((response) => {
        if (response.selection === 0) {
            mainForm(player);
        }
    });
}

function temperatureForm(player) {
    const form = new ActionFormData()
        .title({ "rawtext": [{ text: "brewinandchewin.book.temperature.title" }] })
        .body({
            "rawtext": [
                { text: "brewinandchewin.book.temperature.body" }
            ]
        })
        .button({ "rawtext": [{ text: "brewinandchewin.book.back" }] }, BACK_BUTTON_ICON);

    form.show(player).then((response) => {
        if (response.selection === 0) {
            mainForm(player);
        }
    });
}

function thanksForm(player) {
    const form = new ActionFormData()
        .title({ "rawtext": [{ text: "brewinandchewin.book.thanks.title" }] })
        .body({
            "rawtext": [
                { translate: "brewinandchewin.book.thanks.permit" },
                { text: "\n" },
                { translate: "brewinandchewin.book.thanks.license" },
                { text: "\n" },
                { translate: "brewinandchewin.book.thanks.contributors" }
            ]
        })
        .button({ "rawtext": [{ text: "brewinandchewin.book.back" }] }, BACK_BUTTON_ICON);

    form.show(player).then((response) => {
        if (response.selection === 0) {
            mainForm(player);
        }
    });
}

function mainForm(player) {
    const form = new ActionFormData()
        .title({ "rawtext": [{ text: "item.brewinandchewin:book_brewinandchewin" }] })
        .body({ "rawtext": [{ text: "brewinandchewin.book.body" }] })
        .button({ "rawtext": [{ text: "brewinandchewin.book.keg.title" }] })
        .button({ "rawtext": [{ text: "brewinandchewin.book.temperature.title" }] })
        .button({ "rawtext": [{ text: "brewinandchewin.book.recipe.title" }] })
        .button({ "rawtext": [{ text: "brewinandchewin.book.thanks.title" }] });

    form.show(player).then((response) => {
        switch (response.selection) {
            case 0:
                kegForm(player);
                break;
            case 1:
                temperatureForm(player);
                break;
            case 2:
                recipeListForm(player);
                break;
            case 3:
                thanksForm(player);
                break;
        }
    });
}

export class BrewinandchewinBook {
    itemUse(args) {
        const player = args.source;
        const itemStack = args.itemStack;
        if (itemStack?.typeId === "brewinandchewin:book_brewinandchewin") {
            mainForm(player);
        }
    }
}

__decorate([
    EventAPI.register(world.afterEvents.itemUse),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ItemUseAfterEvent]),
    __metadata("design:returntype", void 0)
], BrewinandchewinBook.prototype, "itemUse", null);