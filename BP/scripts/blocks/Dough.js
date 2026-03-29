var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { system, BlockPermutation, ItemStack } from "@minecraft/server";
import { EventAPI } from "../lib/EventAPI";
import { ItemUtil } from "../lib/ItemUtil";
const BITS = {
    SAUCE: 1,
    CHEESE: 2,
    BACON: 4,
    SALAMI: 8,
    TOMATO: 16,
    MUSHROOM: 32,
    EGG: 64,
    BASIL: 128,
    HAM: 256,
    SCARLET: 512,
    DORBLU: 1024
};
const ITEM_TO_BIT = {
    "farmersdelight:tomato_sauce": BITS.SAUCE,
    "brewinandchewin:flaxen_cheese_wedge": BITS.CHEESE,
    "farmersdelight:bacon": BITS.BACON,
    "farmerspizzeria:salami": BITS.SALAMI,
    "farmersdelight:tomato": BITS.TOMATO,
    "minecraft:brown_mushroom": BITS.MUSHROOM,
    "minecraft:red_mushroom": BITS.MUSHROOM,
    "minecraft:egg": BITS.EGG,
    "farmerspizzeria:basil_leaves": BITS.BASIL,
    "farmersdelight:ham": BITS.HAM,
    "brewinandchewin:scarlet_cheese_wedge": BITS.SCARLET,
    "farmerspizzeria:dorblu_cheese_wedge": BITS.DORBLU
};
const BIT_MAP = {
    "farmerspizzeria:dough_tomato_sauce": BITS.SAUCE,
    "farmerspizzeria:dough_cheese": BITS.SAUCE | BITS.CHEESE,
    "farmerspizzeria:dough_bacon": BITS.SAUCE | BITS.CHEESE | BITS.BACON,
    "farmerspizzeria:dough_tomatoes": BITS.SAUCE | BITS.CHEESE | BITS.TOMATO,
    "farmerspizzeria:dough_mushrooms": BITS.SAUCE | BITS.CHEESE | BITS.MUSHROOM,
    "farmerspizzeria:dough_two_cheeses": BITS.SAUCE | BITS.CHEESE | BITS.SCARLET,
    "farmerspizzeria:dough_two_cheeses_2": BITS.SAUCE | BITS.CHEESE | BITS.DORBLU,
    "farmerspizzeria:dough_tomatoes_mushrooms": BITS.SAUCE | BITS.CHEESE | BITS.TOMATO | BITS.MUSHROOM,
    "farmerspizzeria:dough_bacon_pepperoni": BITS.SAUCE | BITS.CHEESE | BITS.BACON | BITS.SALAMI,
    "farmerspizzeria:raw_pepperoni_pizza": BITS.SAUCE | BITS.CHEESE | BITS.SALAMI,
    "farmerspizzeria:raw_margarita_pizza": BITS.SAUCE | BITS.CHEESE | BITS.TOMATO | BITS.BASIL,
    "farmerspizzeria:raw_funghi_pizza": BITS.SAUCE | BITS.CHEESE | BITS.TOMATO | BITS.MUSHROOM | BITS.BASIL,
    "farmerspizzeria:raw_carbonara_pizza": BITS.SAUCE | BITS.CHEESE | BITS.BACON | BITS.EGG,
    "farmerspizzeria:raw_meat_feast_pizza": BITS.SAUCE | BITS.CHEESE | BITS.BACON | BITS.SALAMI | BITS.HAM,
    "farmerspizzeria:raw_cheese_pizza": BITS.SAUCE | BITS.CHEESE | BITS.SCARLET | BITS.DORBLU
};
const REVERSE_MAP = {
    "farmerspizzeria:dough_cheese": { prev: "farmerspizzeria:dough_tomato_sauce", give: "brewinandchewin:flaxen_cheese_wedge" },
    "farmerspizzeria:dough_bacon": { prev: "farmerspizzeria:dough_cheese", give: "farmersdelight:bacon" },
    "farmerspizzeria:dough_tomatoes": { prev: "farmerspizzeria:dough_cheese", give: "farmersdelight:tomato" },
    "farmerspizzeria:raw_pepperoni_pizza": { prev: "farmerspizzeria:dough_cheese", give: "farmerspizzeria:salami" },
    "farmerspizzeria:dough_two_cheeses": { prev: "farmerspizzeria:dough_cheese", give: "brewinandchewin:scarlet_cheese_wedge" },
    "farmerspizzeria:dough_two_cheeses_2": { prev: "farmerspizzeria:dough_cheese", give: "farmerspizzeria:dorblu_cheese_wedge" },
    "farmerspizzeria:dough_mushrooms": { prev: "farmerspizzeria:dough_cheese", give: "minecraft:brown_mushroom" },
    "farmerspizzeria:dough_tomatoes_mushrooms": { prev: "farmerspizzeria:dough_tomatoes", give: "minecraft:brown_mushroom" },
    "farmerspizzeria:raw_margarita_pizza": { prev: "farmerspizzeria:dough_tomatoes", give: "farmerspizzeria:basil_leaves" },
    "farmerspizzeria:raw_funghi_pizza": { prev: "farmerspizzeria:dough_tomatoes_mushrooms", give: "farmerspizzeria:basil_leaves" },
    "farmerspizzeria:raw_cheese_pizza": { prev: "farmerspizzeria:dough_two_cheeses", give: "farmerspizzeria:dorblu_cheese_wedge" },
    "farmerspizzeria:dough_bacon_pepperoni": { prev: "farmerspizzeria:dough_bacon", give: "farmerspizzeria:salami" },
    "farmerspizzeria:raw_carbonara_pizza": { prev: "farmerspizzeria:dough_bacon", give: "minecraft:egg" },
    "farmerspizzeria:raw_meat_feast_pizza": { prev: "farmerspizzeria:dough_bacon_pepperoni", give: "farmersdelight:ham" }
};
const TARGET_BIT_TO_ID = Object.fromEntries(Object.entries(BIT_MAP).map(([id, bits]) => [bits, id]));
export class Dough {
    constructor() {
        this.onPlayerInteract = this.onPlayerInteract.bind(this);
    }
    onPlayerInteract(args) {
        const { block, player, dimension } = args;
        const blockId = block.typeId;
        const inventory = player?.getComponent("inventory");
        if (!inventory) return;
        const container = inventory.container;
        const slot = player.selectedSlotIndex;
        const itemStack = container.getItem(slot);
        if (player.isSneaking && !itemStack) {
            const undo = REVERSE_MAP[blockId];
            if (undo) {
                const facing = block.permutation.getState("minecraft:cardinal_direction");
                let prevPerm = BlockPermutation.resolve(undo.prev);
                if (undo.prev === "farmerspizzeria:dough") prevPerm = prevPerm.withState("farmerspizzeria:dough_stage", 2);
                if (facing !== undefined) try { prevPerm = prevPerm.withState("minecraft:cardinal_direction", facing); } catch (e) { }
                block.setPermutation(prevPerm);
                dimension.spawnItem(new ItemStack(undo.give, 1), { x: block.location.x + 0.5, y: block.location.y + 0.5, z: block.location.z + 0.5 });
                dimension.playSound("mob.slime.big", block.center());
                return;
            }
        }
        if (!itemStack) return;
        const heldItemId = itemStack.typeId;
        if (blockId === "farmerspizzeria:dough") {
            const stage = block.permutation.getState("farmerspizzeria:dough_stage");
            if (stage < 2) {
                if (heldItemId === "farmerspizzeria:rolling_pin") {
                    block.setPermutation(block.permutation.withState("farmerspizzeria:dough_stage", stage + 1));
                    dimension.playSound("mob.slime.big", block.center());
                }
                return;
            }
            if (stage === 2 && heldItemId === "farmersdelight:tomato_sauce") {
                this.apply(block, "farmerspizzeria:dough_tomato_sauce", player, container, slot, true);
                return;
            }
            return;
        }
        const currentBits = BIT_MAP[blockId];
        const addBit = ITEM_TO_BIT[heldItemId];
        if (currentBits !== undefined && addBit !== undefined) {
            if ((currentBits & addBit) === 0) {
                const nextId = TARGET_BIT_TO_ID[currentBits | addBit];
                if (nextId) {
                    this.apply(block, nextId, player, container, slot, false);
                }
            }
        }
    }
    apply(block, nextId, player, container, slot, isSauce) {
        const facing = block.permutation.getState("minecraft:cardinal_direction");
        let nextPerm = BlockPermutation.resolve(nextId);
        if (facing !== undefined) try { nextPerm = nextPerm.withState("minecraft:cardinal_direction", facing); } catch (e) { }
        block.setPermutation(nextPerm);
        block.dimension.playSound("mob.slime.big", block.center());
        if (nextId.includes("raw_")) {
            const count = Math.floor(Math.random() * 2) + 3;
            for (let i = 0; i < count; i++) {
                block.dimension.spawnParticle("minecraft:villager_happy", {
                    x: block.location.x + 0.2 + Math.random() * 0.6,
                    y: block.location.y + 0.4,
                    z: block.location.z + 0.2 + Math.random() * 0.6
                });
            }
        }
        if (player && player.getGameMode().toLowerCase() !== "creative") {
            if (isSauce) block.dimension.spawnItem(new ItemStack("minecraft:bowl", 1), player.location);
            ItemUtil.clearItem(container, slot, 1);
        }
    }
    register(args) {
        args.blockComponentRegistry.registerCustomComponent('farmerspizzeria:dough', new Dough());
    }

}
__decorate([
    EventAPI.register(system.beforeEvents.startup),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], Dough.prototype, "register", null);