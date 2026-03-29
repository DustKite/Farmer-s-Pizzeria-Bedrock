import { BlockVolume, ItemStack } from "@minecraft/server";
import { FluidType } from "../data/FluidType";
import { ItemAPI } from "./ItemAPI";
import { TemperatureBlockType } from "../data/TemperatureBlockType";
const fluidType = new FluidType().fluidType;
export class KegRecipeHolder {
    constructor(container, entity) {
        this.container = container;
        this.entity = entity;
    }
    /**检查液体槽物品是否在液体列表里*/
    isFluidTypeInFluidSlot() {
        const fluidId = this.container.getItem(5)?.typeId;
        if (!fluidId)
            return false;
        return fluidId in fluidType;
    }
    /**获取 液体槽物品 对应的 物品id*/
    getFluidContainerInFluidSlot() {
        const fluidId = this.container.getItem(5)?.typeId;
        if (!fluidId)
            return undefined;
        return fluidType[fluidId];
    }
    /** 检查容器槽物品是否在液体列表里*/
    isFluidInContainerSlot() {
        const fluidInContainerSlot = this.container.getItem(4)?.typeId;
        if (!fluidInContainerSlot)
            return false;
        return fluidInContainerSlot in fluidType;
    }
    /**  获取容器槽里的液体 对应的 物品id*/
    getFluidContainerInContainerSlot() {
        const fluidId = this.container.getItem(4)?.typeId;
        if (!fluidId)
            return undefined;
        return fluidType[fluidId];
    }
    /**  检测温度*/
    checkTemperature() {
        const entity = this.entity;
        const TemperatureBlock = new TemperatureBlockType();
        const { x, y, z } = entity.location;
        const fromLocation = { x: x - 1, y: y - 1, z: z - 1 };
        const toLocation = { x: x + 1, y: y + 1, z: z + 1 };
        const detectLocs = new BlockVolume(fromLocation, toLocation).getBlockLocationIterator();
        let coldBlock = 0;
        let hotBlock = 0;
        for (const location of detectLocs) {
            const block = entity.dimension.getBlock(location);
            if (!block)
                continue;
            if (TemperatureBlock.freezeSources.includes(block?.typeId) || block.hasTag("brewinandchewin:freeze_sources")) {
                coldBlock++;
            }
            if (TemperatureBlock.hotSources.includes(block?.typeId) || block.hasTag("farmersdelight:heat_source") || block.hasTag("brewinandchewin:heat_source")) {
                hotBlock++;
            }
        }
        const temperatureBlockNumber = coldBlock - hotBlock;
        if (temperatureBlockNumber >= 5)
            return 1;
        else if (temperatureBlockNumber >= 2 && temperatureBlockNumber <= 4)
            return 2;
        else if (temperatureBlockNumber >= -1 && temperatureBlockNumber <= 1)
            return 3;
        else if (temperatureBlockNumber >= -4 && temperatureBlockNumber <= -2)
            return 4;
        else
            return 5;
    }
    /**  配方匹配*/
    matchesRecipe(recipe) {
        const baseFluid = this.container.getItem(5);
        const fluidId = baseFluid?.typeId;
        const temperature = this.entity.getDynamicProperty("brewinandchewin:temperature");
        if (recipe.temperature !== temperature)
            return false;
        if (recipe.basefluid) {
            if (!fluidId || recipe.basefluid !== fluidId)
                return false;
            const hasEnoughFluid = (baseFluid.maxAmount >= 4 && baseFluid.amount >= 4) || (baseFluid.maxAmount < 4);
            if (!hasEnoughFluid)
                return false;
        }
        let requiredItems = recipe.ingredients.map(ing => ({ ...ing }));
        for (let i = 0; i <= 3; i++) {
            const item = this.container.getItem(i);
            if (!item)
                continue;
            for (let j = 0; j < requiredItems.length; j++) {
                let ingredient = requiredItems[j];
                // 直接匹配物品 ID
                if (ingredient.item && ingredient.item === item.typeId) {
                    requiredItems.splice(j, 1);
                    break;
                }
                // 匹配 Tag
                if (ingredient.tag && item.hasTag(ingredient.tag)) {
                    requiredItems.splice(j, 1);
                    break;
                }
            }
        }
        // 所有所需材料都匹配
        return requiredItems.length == 0;
    }
    /**  检测输出槽是否可以输出配方*/
    applyRecipe(recipe) {
        const outputSlot = this.container.getItem(6);
        const recipeOutput = recipe.result.item;
        const recipeOutputCount = recipe.result.count;
        if (!outputSlot)
            return true;
        if (outputSlot.typeId !== recipeOutput)
            return false;
        const totalCount = outputSlot.amount + recipeOutputCount;
        const maxStack = outputSlot.maxAmount;
        if (totalCount > maxStack)
            return false;
        return true;
    }
    /**  配方进度*/
    findMatchingRecipe(recipes) {
        for (let recipe of recipes) {
            if (this.matchesRecipe(recipe) && this.applyRecipe(recipe)) {
                const progress = this.entity.getDynamicProperty("brewinandchewin:progress") ?? 0;
                if (progress >= recipe.fermentingtime) {
                    this.entity.setDynamicProperty("brewinandchewin:progress", 0);
                    this.container.setItem(5, new ItemStack(recipe.result.item, recipe.result.count ?? 1));
                    for (let i = 0; i <= 3; i++) {
                        ItemAPI.clear(this.entity, i);
                    }
                }
                else
                    this.entity.setDynamicProperty("brewinandchewin:progress", progress + 1);
                this.entity.setDynamicProperty("brewinandchewin:progress_bar", this.calculatePercentageBar(progress, recipe.fermentingtime));
                this.container.setItem(7, new ItemStack(this.calculatePercentage(progress, recipe.fermentingtime)));
                return recipe;
            }
        }
        this.container.setItem(7, new ItemStack("farmersdelight:cooking_pot_arrow_0"));
        this.entity.setDynamicProperty("brewinandchewin:progress", 0);
        this.entity.setDynamicProperty("brewinandchewin:progress_bar", "0.00 / 100");
        return undefined;
    }
    /**  计算百分比*/
    calculatePercentage(numerator, denominator) {
        if (denominator === 0) {
            return "farmersdelight:cooking_pot_arrow_0";
        }
        const percentage = Math.floor((numerator / denominator) * 10) * 10;
        return `farmersdelight:cooking_pot_arrow_${percentage}`;
    }
    calculatePercentageBar(numerator, denominator) {
        if (denominator === 0) {
            return `0.00 / 100`;
        }
        let percentage = (numerator / denominator) * 100;
        return `${percentage.toFixed(2)} / 100`;
    }
    /**  填充输出槽*/
    fillResultSlot() {
        const resultItem = this.container.getItem(6);
        const fluidItem = this.container.getItem(5);
        const containerItem = this.container.getItem(4);
        if (!this.isFluidTypeInFluidSlot()) {
            if (!resultItem) {
                if (!fluidItem)
                    return;
                this.container.setItem(6, new ItemStack(fluidItem.typeId));
                ItemAPI.clear(this.entity, 5);
                return;
            }
            if (resultItem.typeId != fluidItem?.typeId) {
                return;
            }
            const resultCount = resultItem.amount;
            if (resultCount == resultItem.maxAmount)
                return;
            resultItem.amount = resultCount + 1;
            this.container.setItem(6, resultItem);
            ItemAPI.clear(this.entity, 5);
            return;
        }
        if (!containerItem)
            return;
        if (this.getFluidContainerInFluidSlot() != containerItem.typeId)
            return;
        if (!resultItem) {
            if (!fluidItem)
                return;
            this.container.setItem(6, new ItemStack(fluidItem.typeId));
            ItemAPI.clear(this.entity, 4);
            ItemAPI.clear(this.entity, 5);
            return;
        }
        if (resultItem.typeId != fluidItem?.typeId) {
            return;
        }
        const resultCount = resultItem.amount;
        if (resultCount == resultItem.maxAmount)
            return;
        resultItem.amount = resultCount + 1;
        this.container.setItem(6, resultItem);
        ItemAPI.clear(this.entity, 4);
        ItemAPI.clear(this.entity, 5);
    }
    /**  手动往溶液槽装物品*/
    fillFluidSlot() {
        if (!this.isFluidInContainerSlot())
            return;
        const returnItem = this.getFluidContainerInContainerSlot();
        if (!returnItem)
            return;
        const resultItem = this.container.getItem(6);
        const fluidItem = this.container.getItem(5);
        const containerItem = this.container.getItem(4);
        if (!containerItem)
            return;
        if (!fluidItem) {
            if (!resultItem) {
                this.container.setItem(5, new ItemStack(containerItem.typeId, 1));
                this.container.setItem(6, new ItemStack(returnItem));
                ItemAPI.clear(this.entity, 4);
                return;
            }
            if (returnItem != resultItem.typeId)
                return;
            const resultCount = resultItem.amount;
            if (resultCount == resultItem.maxAmount)
                return;
            resultItem.amount = resultCount + 1;
            this.container.setItem(5, new ItemStack(containerItem.typeId, 1));
            this.container.setItem(6, resultItem);
            ItemAPI.clear(this.entity, 4);
            return;
        }
        //溶液槽有物品时
        if (containerItem.typeId != fluidItem?.typeId)
            return;
        ///输出槽无物品时
        if (!resultItem) {
            if (fluidItem.maxAmount >= 4) {
                if (fluidItem.amount > 3)
                    return;
                fluidItem.amount = fluidItem.amount + 1;
                this.container.setItem(5, fluidItem);
                this.container.setItem(6, new ItemStack(returnItem));
                ItemAPI.clear(this.entity, 4);
            }
            return;
        }
        ///输出槽有物品时
        if (fluidItem.maxAmount >= 4) {
            if (fluidItem.amount < 4) {
                fluidItem.amount = fluidItem.amount + 1;
                if (returnItem != resultItem.typeId)
                    return;
                const resultCount = resultItem.amount;
                if (resultCount == resultItem.maxAmount)
                    return;
                resultItem.amount = resultCount + 1;
                this.container.setItem(5, fluidItem);
                this.container.setItem(6, resultItem);
                ItemAPI.clear(this.entity, 4);
            }
        }
    }
}
