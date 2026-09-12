var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { world } from "@minecraft/server";
import { EventAPI } from "../lib/EventAPI";

export class FoodRegister {
    eat(args) {
        const itemStack = args.itemStack;
        const player = args.source;
        const useDuration = args.useDuration;
        const effects = player.getEffects();
        if (itemStack && useDuration == 0) {
            switch (itemStack.typeId) {
                case "farmerspizzeria:meat_feast_pizza_slice":
                    player.addEffect('saturation', 90 * 20, { amplifier: 0 });
                    break;
                case "farmerspizzeria:cheese_pizza_slice":
                    player.addEffect('saturation', 60 * 20, { amplifier: 0 });
                    break;
                case "farmerspizzeria:margarita_pizza_slice":
                    player.addEffect('saturation', 30 * 20, { amplifier: 0 });
                    break;
                case "farmerspizzeria:charcoal_pizza_slice":
                    for (const effect of effects) {
                        player.removeEffect(effect.typeId);
                    }
                    player.addEffect('nausea', 15 * 20, { amplifier: 0 });
                    break;
                case "farmerspizzeria:abyssal_marinara_pizza_slice":
                    player.addEffect('conduit_power', 30 * 20, { amplifier: 0 });
                    break;
            }
        }
    }
}

__decorate([
    EventAPI.register(world.afterEvents.itemCompleteUse),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], FoodRegister.prototype, "eat", null);