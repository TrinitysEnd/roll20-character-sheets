var proficiencyList = ["Weapon", "Armor", "Skill", "Tool", "Language"];
var abilityList = ["Strength", "Dexterity", "Constitution", "Intelligence", "Wisdom", "Charisma"];
var getList = ["data-Ability Score Increase", "data-Ability Score Choice", "data-HP per level", "data-Expertise Choice 1", "data-Expertise Choice 2", "data-Powers", "data-Class Powers", "Powercasting Ability", "Hit Die", "Subclass Name", "data-Equipment", "Starting Gold", "data-Subclass Level", "Powercasting Ability", "Suggested Abilities", "data-Feats", "data-Background Choice Name"];
var changeListeners = "mancerchange:race_ability_choice1 mancerchange:race_ability_choice2 mancerchange:subrace_ability_choice1 mancerchange:subrace_ability_choice2 mancerchange:custom_hit_die mancerchange:feat_ability_choice";
var proficiencyNum = 4;
var customListeners = "";
var customProfListeners = "";
var customLanguageListeners = "";
var powerListeners = "";
var recalcCallNumber = 0;
for(var x = 1; x<=9; x++) {
    powerListeners += " mancerchange:race_level0_choice" + x;
    powerListeners += " mancerchange:race_level1_choice" + x;
    powerListeners += " mancerchange:class_level0_choice" + x;
    powerListeners += " mancerchange:class_level1_choice" + x;
}
_.each(abilityList, function(ability){
    changeListeners += " mancerchange:race_custom_" + ability.toLowerCase();
    changeListeners += " mancerchange:subrace_custom_" + ability.toLowerCase();
});

_.each(proficiencyList, function(prof) {
    for(var x=1; x<=proficiencyNum; x++) {
        changeListeners += " mancerchange:race_" + prof.toLowerCase() + "_choice" + x;
        changeListeners += " mancerchange:subrace_" + prof.toLowerCase() + "_choice" + x;
        changeListeners += " mancerchange:class_" + prof.toLowerCase() + "_choice" + x;
        changeListeners += " mancerchange:subclass_" + prof.toLowerCase() + "_choice" + x;
        changeListeners += " mancerchange:background_" + prof.toLowerCase() + "_choice" + x;
        if(prof == "Language") {
            customLanguageListeners += " mancerchange:race_" + prof.toLowerCase() + "_choice" + x + "_custom";
            customLanguageListeners += " mancerchange:subrace_" + prof.toLowerCase() + "_choice" + x + "_custom";
            customLanguageListeners += " mancerchange:class_" + prof.toLowerCase() + "_choice" + x + "_custom";
            customLanguageListeners += " mancerchange:subclass_" + prof.toLowerCase() + "_choice" + x + "_custom";
            customLanguageListeners += " mancerchange:background_" + prof.toLowerCase() + "_choice" + x + "_custom";
        }
        customListeners += " mancerchange:race_" + prof.toLowerCase() + "_choice" + x;
        customListeners += " mancerchange:subrace_" + prof.toLowerCase() + "_choice" + x;
        customListeners += " mancerchange:class_" + prof.toLowerCase() + "_choice" + x;
        customListeners += " mancerchange:subclass_" + prof.toLowerCase() + "_choice" + x;
        customListeners += " mancerchange:background_" + prof.toLowerCase() + "_choice" + x;

        changeListeners += " mancerchange:class_expertise_choice_" + x;
        changeListeners += " mancerchange:subclass_expertise_choice_" + x;
    }
    getList.push("data-" + prof + " Proficiency");
});

for(var x = 1; x<=4; x++) {
    customProfListeners += "mancerchange:custom_race_prof_type_choice" + x + " ";
    customProfListeners += "mancerchange:custom_class_prof_type_choice" + x + " ";
    customProfListeners += "mancerchange:custom_background_prof_type_choice" + x + " ";
    customProfListeners += "mancerchange:custom_race_prof_name_choice" + x + " ";
    customProfListeners += "mancerchange:custom_class_prof_name_choice" + x + " ";
    customProfListeners += "mancerchange:custom_background_prof_name_choice" + x + " ";
}

var recalcData = function(data) {
    //Recalculate Ability Scores
    var update = {"hit_points": "-"};
    var allAbilities = {race: {}, subrace: {}, feat: {}};
    var disableAbilities = {race: [], subrace: [], feat: []};
    var allProficiencies = {};
    var toSet = {};
    var mancerdata = data || getCharmancerData();
    var additionalHP = 0;

    if(mancerdata["l1-class"] && mancerdata["l1-class"].data.class && mancerdata["l1-class"].data.class["Suggested Abilities"]) {
        update["class_suggested_abilities"] = mancerdata["l1-class"].data.class["Suggested Abilities"];
        showChoices(["class_suggested_abilities_container"]);
    } else {
        update["class_suggested_abilities"] = "";
        hideChoices(["class_suggested_abilities_container"]);
    }
    if(mancerdata["l1-class"] && mancerdata["l1-class"].data.class && mancerdata["l1-class"].data.class["Powercasting Ability"]) {
        update["class_powercasting_ability"] = mancerdata["l1-class"].data.class["Powercasting Ability"];
        showChoices(["class_powercasting_ability_container"]);
    } else {
        update["class_powercasting_ability"] = "";
        hideChoices(["class_powercasting_ability_container"]);
    }

    _.each(mancerdata, function(page){
        _.each(page.values, function(value, name) {
            if(name.search("ability") !== -1) {
                //var choiceSection = name.split("_")[0].replace("sub", "");
                var choiceSection = name.split("_")[0];
                if(page.data[choiceSection] && page.data[choiceSection]["data-Ability Score Choice"]) {
                    var increase = 1;
                    if(typeof page.data[choiceSection]["data-Ability Score Choice"] == "string") {
                        increase = parseInt( _.last( page.data[choiceSection]["data-Ability Score Choice"].split("+") ) );
                    }
                    allAbilities[choiceSection] = allAbilities[choiceSection] || {};
                    allAbilities[choiceSection][value.toLowerCase()] = increase;
                    disableAbilities[choiceSection] = disableAbilities[choiceSection] || [];
                    disableAbilities[choiceSection].push(value);
                }
            }
        });
        _.each(page.data, function(pagedata, increaseSection) {
            if(pagedata["data-Ability Score Increase"]) {
                _.each(pagedata["data-Ability Score Increase"], function(amount, ability) {
                    allAbilities[increaseSection] = allAbilities[increaseSection] || {};
                    allAbilities[increaseSection][ability.toLowerCase()] = amount;
                    disableAbilities[increaseSection] = disableAbilities[increaseSection] || [];
                    disableAbilities[increaseSection].push(ability.toLowerCase());
                });
            }
            if(pagedata["data-HP per level"]) {
                additionalHP += pagedata["data-HP per level"];
            }
        });
    });
    if(mancerdata["l1-race"] && mancerdata["l1-race"].values.race == "Rules:Races") {
        _.each(abilityList, function(ability){
            var custom = mancerdata["l1-race"].values["race_custom_" + ability.toLowerCase()] || false;
            if(custom) {
                allAbilities.race[ability.toLowerCase()] = parseInt(custom);
            }
        });
    }
    if(mancerdata["l1-race"] && mancerdata["l1-race"].values.subrace == "Rules:Races") {
        _.each(abilityList, function(ability){
            var custom = mancerdata["l1-race"].values["subrace_custom_" + ability.toLowerCase()] || false;
            if(custom) {
                allAbilities.subrace[ability.toLowerCase()] = parseInt(custom);
            }
        });
    }
    var abilityTotals = {};
    _.each(allAbilities, function(abilities) {
        _.each(abilities, function(amount, ability) {
            abilityTotals[ability] = abilityTotals[ability] || {bonus: 0};
            abilityTotals[ability].bonus += amount;
        });
    });
    _.each(abilityList, function(upperAbility) {
        var ability = upperAbility.toLowerCase();
        abilityTotals[ability] = abilityTotals[ability] || {bonus: 0, mod: 0};
        if(mancerdata["l1-abilities"] && mancerdata["l1-abilities"].values[ability]) {
            abilityTotals[ability].base = parseInt( mancerdata["l1-abilities"].values[ability].split("~")[0] );
        } else {
            abilityTotals[ability].base = 0;
        }
        abilityTotals[ability].total = abilityTotals[ability].bonus + abilityTotals[ability].base;
        abilityTotals[ability].mod = Math.floor((abilityTotals[ability].total - 10)/2);
        update[ability + "_total"] = abilityTotals[ability].total == 0 ? "-" : abilityTotals[ability].total;
    });
    allAbilities.totals = abilityTotals;

    if(mancerdata["l1-class"] && (mancerdata["l1-class"].data.class || mancerdata["l1-class"].values["custom_hit_die"])) {
        var basehp = mancerdata["l1-class"].data.class ? mancerdata["l1-class"].data.class["Hit Die"] : mancerdata["l1-class"].values["custom_hit_die"];
        var conmod = abilityTotals.constitution.base > 0 ? abilityTotals.constitution.mod : 0;
        update["hit_points"] = parseInt(basehp.replace("d", "")) + additionalHP + conmod;
    }

    _.each(disableAbilities, function(disable, disablesection) {
        disableCharmancerOptions(disablesection + "_ability_choice1", disable);
        disableCharmancerOptions(disablesection + "_ability_choice2", disable);
    });

    allProficiencies.auto = {};
    //Recalculate Proficiencies
    _.each(proficiencyList, function(prof){
        //First get a list of all proficiencies
        var finalProfs = [];
        _.each(mancerdata, function(page){
            _.each(page.values, function(value, name) {
                if((name.search(prof.toLowerCase()) !== -1 || name.search("class_feature_choice_3") !== -1) && _.last(name.split("_")) != "custom") {
                    if(prof == "Language") {
                        if(value != "custom") {
                            if (value.split(":")[0] == "Proficiencies") {
                                finalProfs.push( _.last(value.split(":")) );
                                toSet[name + "_custom"] = "";
                            }
                        } else {
                            if(page.values[name + "_custom"]) {
                                finalProfs.push(page.values[name + "_custom"]);
                            }
                        }
                    } else {
                        finalProfs.push( _.last(value.split(":")) );
                    }
                }
            });
            _.each(page.data, function(pagedata, section) {
                if(pagedata["data-" + prof + " Proficiency"] && pagedata["data-" + prof + " Proficiency"].Proficiencies) {
                    finalProfs = finalProfs.concat(pagedata["data-" + prof + " Proficiency"].Proficiencies);
                    allProficiencies.auto[section] = allProficiencies.auto[section] || [];
                    allProficiencies.auto[section] = allProficiencies.auto[section].concat(pagedata["data-" + prof + " Proficiency"].Proficiencies);
                }
            });
        });
        allProficiencies[prof.toLowerCase()] = _.without(_.uniq(finalProfs), "custom");
    });

    var expertiseSelects = {};
    var currentExpertise = [];
    //Get a list of active expertise selects
    _.each(mancerdata, function(page, pagename) {
        _.each(page.data, function(data, section) {
            for(var num=1; num<=proficiencyNum; num++) {
                if( _.keys(data).indexOf("data-Expertise Choice " + num) != -1 ) {
                    expertiseSelects[section + "_expertise_choice_" + num] = data["data-Expertise Choice " + num];
                }
            }
        });
    });
    _.each(expertiseSelects, function(fillArray, selectName) {
        var expertChoices = [];
        var options = {category: "Proficiencies", silent: true}
        var currentValue = "";
        //Create the list of values for this select
        _.each(fillArray, function(expert) {
            if(expert == "KNOWN") {
                expertChoices = expertChoices.concat(allProficiencies.skill);
            } else {
                expertChoices.push(expert);
            }
        });
        //Get the current value of the select
        _.each(mancerdata, function(page){
            _.each(page.values, function(value, name) {
                if(name == selectName) {
                    currentValue = _.last(value.split(":"));
                }
            });
        });

        if(currentValue != "") {
            //If the current value is not available, set it to blank. otherwise, add it to the list of expertise skills
            if(expertChoices.indexOf(currentValue) == -1) {
                options.selected = "";
                toSet[selectName] = "";
            } else {
                currentExpertise.push(currentValue);
            }
        }
        setCharmancerOptions(selectName, expertChoices, options);
    });
    //Go back through and disable expertise options
    _.each(expertiseSelects, function(fillArray, selectName) {
        disableCharmancerOptions(selectName, currentExpertise, {category: "Proficiencies"});
    });
    _.each(proficiencyList, function(prof){
        //Now go through and disable the proficiencies
        _.each(["race", "subrace", "class", "subclass", "background"], function(section) {
            for(var num=1; num<=proficiencyNum; num++) {
                var name = [section, prof.toLowerCase(), "choice"].join("_") + num;
                disableCharmancerOptions(name, allProficiencies[prof.toLowerCase()].concat(currentExpertise), {category: "Proficiencies"});
            };
        });
    });

    setCharmancerText(update);
    if(!data) {
        setAttrs(toSet);
    }
    return {abilities: allAbilities, proficiencies: allProficiencies, expertise: _.uniq(currentExpertise)}
};

var handleAbilities = function(data, section) {
    var showList = [];
    if(data["data-Ability Score Increase"]) {
        showList.push(section + "_abilities");
    }
    if(data["data-Ability Score Choice"]) {
        showList.push(section + "_abilities");
        showList.push(section + "_ability_choice1");
        if(data["data-Ability Score Choice"].split("+")[0] == "2") {
            showList.push(section + "_ability_choice2");
        }
    };
    return showList;
};

var handleProficiencies = function(data, section, source) {
    var showList = [];
    var collected = recalcData();
    _.each(proficiencyList, function(type) {
        if(data["data-" + type + " Proficiency"]) {
            showList.push(section + "_" + type.toLowerCase() + "_row");
            var json = JSON.parse(data["data-" + type + " Proficiency"]);
            for(var num=1; num<=proficiencyNum; num++) {
                var className = section + "_" + type.toLowerCase() + "_choice" + num;
                var settings = {category: "Proficiencies", disable: collected.proficiencies[type.toLowerCase()]};
                if(source == "player") {
                    settings.selected = "";
                }
                if(json["Choice " + num]) {
                    showList.push(className);
                    if(json["Choice " + num] == "any") {
                        setCharmancerOptions(className, "Category:Proficiencies \"Type:" + type + "\"", settings);
                    } else {
                        if(json["Choice " + num][0].indexOf("Subtype:") != -1) {
                            setCharmancerOptions(className, "Category:Proficiencies \"Type:" + type + "\" \"" + json["Choice " + num][0] + "\"", settings);
                        } else {
                            setCharmancerOptions(className, json["Choice " + num], settings);
                        }
                    }
                } else {
                    setCharmancerOptions(className, []);
                }
            };
        } else {
            for(var x=1; x<=proficiencyNum; x++) {
                var className = section + "_" + type.toLowerCase() + "_choice" + x;
                setCharmancerOptions(className, []);
            };
        }
    });
    for(var x = 1; x<=proficiencyNum; x++) {
        var className = section + "_expertise_choice_" + x;
        if(data["data-Expertise Choice " + x]) {
            var json = JSON.parse(data["data-Expertise Choice " + x]);
            var expertChoices = [];
            showList.push(className);
            showList.push(section + "_expertise_row");
            _.each(json, function(expert) {
                if(expert == "KNOWN") {
                    expertChoices = expertChoices.concat(collected.proficiencies.skill);
                } else {
                    expertChoices.push(expert);
                }
                setCharmancerOptions(className, expertChoices, {category: "Proficiencies", disable: collected.expertise});
            });
        } else {
            setCharmancerOptions(className, []);
        }
    }
    return showList;
};

var knownPowers = function() {
    var mancerdata = getCharmancerData();
    var allPowers = {
        race: false,
        class: false,
        known: [],
        errors: {class: [], race: []}
    };
    var stats = recalcData();
    var racename = getName("race", mancerdata, true);
    var subracename = getName("subrace", mancerdata, true);
    var classname = getName("class", mancerdata, true);
    var subclassname = getName("subclass", mancerdata, true);
    var classAbility = mancerdata["l1-class"] && mancerdata["l1-class"].data.class && mancerdata["l1-class"].data.class["Powercasting Ability"] ? mancerdata["l1-class"].data.class["Powercasting Ability"] : "";
    var expandedList = {};

    //Collect expanded power lists
    if(mancerdata["l1-class"] && mancerdata["l1-class"].data.subclass && mancerdata["l1-class"].data.subclass["data-Class Powers"]) {
        _.each(mancerdata["l1-class"].data.subclass["data-Class Powers"], function(power, level) {
            if(power["Expanded List"]) {
                expandedList[level] = power["Expanded List"];
            }
        });
    }
    //Collect data from data-Powers
    _.each(["race", "subrace", "class", "subclass"], function(section) {
        var parentsection = section.replace("sub", "");
        if(mancerdata["l1-" + parentsection] && mancerdata["l1-" + parentsection].data[section] && mancerdata["l1-" + parentsection].data[section]["data-Powers"]) {
            allPowers[parentsection] = allPowers[parentsection] || {known: [], choices: []}
            _.each(mancerdata["l1-" + parentsection].data[section]["data-Powers"], function(power) {
                if(power.Name) {
                    allPowers[parentsection].known.push(power);
                    allPowers.known.push(power.Name);
                } else {
                    allPowers[parentsection].choices.push(power);
                }
            });
        }
    });
    //Collect data from data-Class Powers
    _.each(["class", "subclass"], function(section) {
        if(mancerdata["l1-class"] && mancerdata["l1-class"].data[section] && mancerdata["l1-class"].data[section]["data-Class Powers"]) {
            allPowers.class = allPowers.class || {known: [], choices: []}
            _.each(mancerdata["l1-class"].data[section]["data-Class Powers"], function(power, level) {
                var numPowers = 0;
                expandedList[level] = expandedList[level] || [];
                if(power.Prepared) {
                    numPowers = Math.max(stats.abilities.totals[power.Prepared.split("+")[0].toLowerCase()].mod, 0) + parseInt(power.Prepared.split("+")[1]);
                }
                if(power.Choice) {
                    numPowers = parseInt(power.Choice);
                }
                if(numPowers > 0) {
                    for(var x = 1; x <= numPowers; x++) {
                        var thisPower = {List: classname, Level: parseInt(level), Ability: classAbility};
                        thisPower["Expanded List"] = expandedList[level];
                        allPowers.class.choices.push(thisPower);
                    }
                }
                _.each(power.Known, function(known) {
                    var thisPower = {Name: known, Level: parseInt(level), Ability: classAbility};
                    allPowers.class.known.push(thisPower);
                    allPowers.known.push(known);
                });
            });
        }
    });
    //Collect custom race/subrace powers
    if(mancerdata["l1-race"] && mancerdata["l1-race"].values.custom_race_power_ability) {
        var raceAbility = mancerdata["l1-race"].values.custom_race_power_ability;
        var numPowers = mancerdata["l1-race"].values.custom_race_power_number;
        var powerList = mancerdata["l1-race"].values.custom_race_power_list;
        if(powerList) {
            allPowers.race = allPowers.race || {known: [], choices: []}
            for(var x=1; x<=numPowers; x++) {
                var thisPower = {
                    Ability: raceAbility,
                    Level: 0,
                    List: powerList
                };
                allPowers.race.choices.push(thisPower);
            }
        } else {
            allPowers.errors.race.push("custom_race_power_list");
        }
    }
    //Collect custom class powers
    if(mancerdata["l1-class"] && mancerdata["l1-class"].values.custom_class_power_ability) {
        var customAbility = mancerdata["l1-class"].values.custom_class_power_ability;
        var customList = mancerdata["l1-class"].values.custom_class_power_list;
        var customPowers = {"0": mancerdata["l1-class"].values.custom_class_cantrip_number, "1": mancerdata["l1-class"].values.custom_class_power_number};
        if(customList && (customPowers["0"] > 0 || customPowers["1"] > 0)) {
            allPowers.class = allPowers.class || {known: [], choices: []}
            _.each(customPowers, function(number, level) {
                for(var x=1; x<=number; x++) {
                    var thisPower = {
                        Ability: customAbility,
                        Level: level,
                        List: customList
                    };
                    allPowers.class.choices.push(thisPower);
                }
            });
        } else {
            allPowers.errors.class.push("custom_class_power_list");
            allPowers.errors.class.push("custom_class_power_number");
        }
    }
    //Collect custom subclass powers
    if(mancerdata["l1-class"] && mancerdata["l1-class"].values.subclass == "Rules:Classes") {
        var customPowers = {"0": mancerdata["l1-class"].values.custom_subclass_cantrip_number, "1": mancerdata["l1-class"].values.custom_subclass_power_number};
        if(customPowers["0"] > 0 || customPowers["1"] > 0) {
            allPowers.class = allPowers.class || {known: [], choices: []}
            _.each(customPowers, function(number, level) {
                var customList = classname.toLowerCase();
                if(level == "0" && mancerdata["l1-class"].values.custom_subclass_cantrip_list) customList = mancerdata["l1-class"].values.custom_subclass_cantrip_list;
                if(level == "1" && mancerdata["l1-class"].values.custom_subclass_power_list) customList = mancerdata["l1-class"].values.custom_subclass_power_list;
                for(var x=1; x<=number; x++) {
                    var thisPower = {
                        Ability: classAbility,
                        Level: level,
                        List: customList
                    };
                    allPowers.class.choices.push(thisPower);
                }
            });
        }
    }
    //Collect data from choices
    if(mancerdata["l1-powers"]) {
        var validchoices = [];
        if(mancerdata["l1-powers"].values.race_powers == racename + subracename) validchoices.push("race");
        if(mancerdata["l1-powers"].values.class_powers == classname + subclassname) validchoices.push("class");
        _.each(validchoices, function(section) {
            for(var x=1; x<=9; x++) {
                if(mancerdata["l1-powers"].values[section + "_level0_choice" + x]) {
                    allPowers.known.push(mancerdata["l1-powers"].values[section + "_level0_choice" + x].substring(7));
                }
                if(mancerdata["l1-powers"].values[section + "_level1_choice" + x]) {
                    allPowers.known.push(mancerdata["l1-powers"].values[section + "_level1_choice" + x].substring(7));
                }
            }
        });
    }
    return allPowers;
};

var cleanEquipment = function(equipment) {
    var current_string = "(";
    var hasDouble = false;
    var firstItem = true;
    _.each(equipment, function(item) {
        if (item.search("~DBL") != -1) {
            hasDouble = true;
            item.replace("~DBL","");
        }
        item = item.replace(/"Item Type":(.|)Weapon.*\b/g, "Any Weapon");
        item = item.replace(/Subtype:(.|)Martial.*\b("|)/g, "Any Martial Weapon");
        item = item.replace(/Subtype:(.|)Simple.*\b("|)/g, "Any Simple Weapon");
        item = item.replace(/Subtype:(.|)Artisan's Tools.*\b("|)/g, "A Set of Artisan's Tools");
        item = item.replace(/Subtype:(.|)Gaming Set.*\b("|)/g, "A Gaming Set");
        item = item.replace(/Subtype:(.|)Musical Instrument.*\b("|)/g, "A Musical Instrument");
        if (!firstItem) current_string += " or ";
        current_string += item;
        firstItem = false;
    });
    current_string += ")";
    if (hasDouble) {
        current_string = "two of " + current_string;
    }
    return current_string.replace(/,/g, ", ");
};

var getName = function(request, data, custom) {
    data = data || getCharmancerData();
    var section = request.replace("sub", "");
    var result = "";
    var customString = custom ? "custom" : "";
    if( data["l1-" + section] && data["l1-" + section].values[request] ) {
        result = data["l1-" + section].values[request + "_name"] || data["l1-" + section].values[request];
    }
    result = result.split(":")[0] == "Rules" || result.split(":")[0] == "CategoryIndex" ? customString : result;
    return _.last(result.split(":"));
}

on("mancerchange:race", function(eventinfo) {
    changeCompendiumPage("sheet-race-info", eventinfo.newValue);
    hideChoices();

    var reset = {};
    if(!(eventinfo.newValue === "" || eventinfo.newValue === undefined)) {
        showChoices(["race_options"]);
    }
    recalcData();

    if(eventinfo.sourceType == "player") {
        reset = {race_ability_choice1: "", race_ability_choice2: "", subrace_ability_choice1: "", subrace_ability_choice2: "", subrace: "", race_name: "", subrace_name: ""};
        _.each(abilityList, function(ability){
            reset["race_custom_" + ability.toLowerCase()] = 0;
            reset["subrace_custom_" + ability.toLowerCase()] = 0;
            reset[ability.toLowerCase() + "_save"] = "";
        });
        for(var x=1; x<=proficiencyNum; x++) {
            reset["custom_race_trait_name_" + x] = "";
            reset["custom_race_trait_desc_" + x] = "";
            reset["custom_race_prof_name_choice" + x] = "";
            reset["custom_race_prof_type_choice" + x] = "";
        }
        reset["custom_race_power_ability"] = "";
        reset["custom_race_power_number"] = "1";
        reset["custom_race_power_list"] = "";
        reset["race_name"] = "";
        reset["subrace_name"] = "";
        reset["has_subrace"] = "";
    }

    if(eventinfo.newValue === "Rules:Races") {
        //Clears saved data for this field
        getCompendiumPage("");
        setAttrs(reset, function() {
            var update = {"race_text": ""};
            var options = eventinfo.sourceType == "player" ? {selected: ""} : {}
            showChoices(["custom_race"]);
            setCharmancerText(update);
            _.each(proficiencyList, function(prof) {
                for(var x=1; x<=proficiencyNum; x++) {
                    var first = true;
                    setCharmancerOptions("race_" + prof.toLowerCase() + "_choice" + x, "Category:Proficiencies Type:" + prof, options, function() { if(first) { first = false; recalcData() } });
                }
            });
        });
    } else {
        getCompendiumPage(eventinfo.newValue, getList, function(p) {
            setAttrs(reset, function() {
                var mancerdata = getCharmancerData();
                var update = {};
                var showList = ["race_always", "race_traits"];
                var possibles = ["race_size", "race_speed", "race_ability_score", "race_traits"];
                var data = p["data"];

                _.each(proficiencyList, function(type){
                    possibles.push("race_" + type.toLowerCase() + "s");
                });
                _.each(possibles, function(key) {
                    update[key] = "";
                });

                if(data["Size"]) {update["race_size"] = data["Size"];};
                if(data["Speed"]) {update["race_speed"] = data["Speed"];};

                showList = showList.concat(handleAbilities(data, "race"));
                if(data["data-Ability Score Increase"]) {
                    var abilityText = [];
                    var json = JSON.parse(data["data-Ability Score Increase"]);
                    _.each(json, function(increase, ability) {
                        abilityText.push(ability + " +" + increase);
                    });
                    update["race_ability_score"] = abilityText.join(", ");
                }

                showList = showList.concat(handleProficiencies(data, "race", eventinfo.sourceType));
                _.each(proficiencyList, function(prof) {
                    if(data["data-" + prof + " Proficiency"]) {
                        var json = JSON.parse(data["data-" + prof + " Proficiency"]);
                        if(json.Proficiencies) {
                            update["race_" + prof.toLowerCase() + "s"] = json.Proficiencies.join(", ");
                        }
                    }
                });

                if(data["data-Traits"] && data["data-Traits"].length > 0) {
                    var traits_final = "";
                    var json = JSON.parse(data["data-Traits"]);
                    _.each(json, function(t, i) {
                        if(t["Name"] && t["Desc"]) {
                            traits_final = traits_final + "<b>" + t["Name"] + ".</b> " + t["Desc"] + "<br>";
                        };
                        update["race_traits"] = traits_final;
                    });
                };

                setCharmancerText(update);

                var race_name = eventinfo.newValue && eventinfo.newValue.split(":").length > 1 && eventinfo.newValue.split(":")[0] === "Races" ? eventinfo.newValue.split(":")[1] : false;
                if(race_name) {
                    var subOptions = {show_source: true};
                    if(eventinfo.sourceType != "player") {
                        subOptions.silent = true;
                    } else {
                        subOptions.selected = "";
                    }

                    setCharmancerOptions("subrace","Category:Subraces data-Parent:" + race_name, subOptions, function(values) {
                        if (values.length) {
                            setAttrs({"has_subrace": "true"});
                            showChoices(["subrace"]);
                        }
                    });
                }
                else {
                    hideChoices(["subrace"]);
                }

                showChoices(showList);
                recalcData();
            });
        });
    }
});

on(customListeners, function(eventinfo) {
    var mancerdata = getCharmancerData();
    var num = parseInt(eventinfo.triggerName.substr(-1));
    var base = eventinfo.triggerName.slice(0, -1);
    var section = eventinfo.triggerName.split("_")[0].replace("sub", "");
    if(mancerdata["l1-" + section].values[base.split("_")[0]]
        && ["Rules", "CategoryIndex"].indexOf(mancerdata["l1-" + section].values[base.split("_")[0]].split(":")[0]) != -1
        && eventinfo.newValue) {
        showChoices([base + (num+1)]);
    }
});

on(customProfListeners, function(eventinfo) {
    var mancerdata = getCharmancerData();
    var num = parseInt(eventinfo.triggerName.substr(-1));
    var section = eventinfo.triggerName.split("_")[1];
    if(mancerdata["l1-" + section].values["custom_" + section + "_prof_name_choice" + num]
        && mancerdata["l1-" + section].values["custom_" + section + "_prof_type_choice" + num]) {
        showChoices(["custom_prof_choice" + (num + 1)]);
    }
});

on("mancerchange:custom_race_trait_name_1 mancerchange:custom_race_trait_name_2 mancerchange:custom_race_trait_name_3 mancerchange:custom_race_trait_name_4 mancerchange:custom_class_trait_name_1 mancerchange:custom_class_trait_name_2 mancerchange:custom_class_trait_name_3 mancerchange:custom_class_trait_name_4", function(eventinfo) {
    var num = parseInt(eventinfo.triggerName.substr(-1));
    if(eventinfo.newValue) {
        showChoices(["custom_trait_" + (num + 1)]);
    }
});

on("mancerchange:custom_race_power_ability mancerchange:custom_class_power_ability", function(eventinfo) {
    var section = eventinfo.triggerName.split("_")[1];
    if(eventinfo.newValue) {
        showChoices(["custom_powercasting"]);
    } else {
        var set = {}
        set["custom_" + section + "_power_number"] = "1";
        set["custom_" + section + "_cantrip_number"] = "1";
        set["custom_" + section + "_power_list"] = "";
        setAttrs(set);
        hideChoices(["custom_powercasting"]);
    }
});

on("mancerchange:subrace", function(eventinfo) {
    changeCompendiumPage("sheet-race-info", eventinfo.newValue);

    var initHide = ["subrace_possible", "custom_trait_2", "custom_trait_3", "custom_trait_4"];
    var reset = {};
    if(eventinfo.newValue === "" || eventinfo.newValue === undefined) {
        initHide.push("subrace_options");
    }
    else {
        showChoices(["subrace_options"]);
    }
    hideChoices(initHide);
    recalcData();
    if(eventinfo.sourceType == "player") {
        reset = {subrace_ability_choice1: "", subrace_ability_choice2: "", subrace_name: ""};
        _.each(abilityList, function(ability){
            reset["race_custom_" + ability.toLowerCase()] = 0;
            reset["subrace_custom_" + ability.toLowerCase()] = 0;
        });
        for(var x=1; x<=proficiencyNum; x++) {
            reset["custom_race_trait_name_" + x] = "";
            reset["custom_race_trait_desc_" + x] = "";
            reset["custom_race_prof_name_choice" + x] = "";
            reset["custom_race_prof_type_choice" + x] = "";
        }
        reset["custom_race_power_ability"] = "";
        reset["custom_race_power_number"] = "1";
        reset["custom_race_power_list"] = "";
        reset["subrace_name"] = "";
    }

    if(eventinfo.newValue === "Rules:Races") {
        //Clears saved data for this field
        getCompendiumPage("");
        setAttrs(reset, function() {
            var update = {"subrace_text": ""};
            var options = eventinfo.sourceType == "player" ? {selected: ""} : {};
            showChoices(["custom_subrace"]);
            setCharmancerText(update);
            _.each(proficiencyList, function(prof) {
                for(var x=1; x<=proficiencyNum; x++) {
                    var first = true;
                    setCharmancerOptions("subrace_" + prof.toLowerCase() + "_choice" + x,
                        "Category:Proficiencies Type:" + prof, options, function() {
                            if(first) { first = false; recalcData(); }
                        });
                }
            });
            deleteCharmancerData(["l1-feat"]);
        });
    } else {
        hideChoices(["custom_subrace"]);
        getCompendiumPage(eventinfo.newValue, getList, function(p) {
            var update = {};
            var showList = ["subrace_choices"];
            var possibles = ["subrace_speed", "subrace_ability_score", "subrace_traits"];
            var data = p["data"];
            _.each(proficiencyList, function(type){
                possibles.push("subrace_" + type.toLowerCase() + "s");
            });
            _.each(possibles, function(key) {
                update[key] = "";
            });

            if(!data["data-Feats"]) deleteCharmancerData(["l1-feat"], function() {recalcData();});

            if(data["Speed"]) {
                update["subrace_speed"] = data["Speed"];
                showList.push("subrace_speed_row");
            };

            showList = showList.concat(handleAbilities(data, "subrace"));
            if(data["data-Ability Score Increase"]) {
                var abilityText = [];
                var json = JSON.parse(data["data-Ability Score Increase"]);
                _.each(json, function(increase, ability) {
                    abilityText.push(ability + " +" + increase);
                });
                update["subrace_ability_score"] = abilityText.join(", ");
            }

            showList = showList.concat(handleProficiencies(data, "subrace", eventinfo.sourceType));
            _.each(proficiencyList, function(prof) {
                if(data["data-" + prof + " Proficiency"]) {
                    var json = JSON.parse(data["data-" + prof + " Proficiency"]);
                    if(json.Proficiencies) {
                        update["subrace_" + prof.toLowerCase() + "s"] = json.Proficiencies.join(", ");
                    }
                }
            });

            if(data["data-Traits"] && data["data-Traits"].length > 0) {
                var traits_final = "";
                var json = JSON.parse(data["data-Traits"]);
                _.each(json, function(t, i) {
                    if(t["Name"] && t["Desc"]) {
                        traits_final = traits_final + "<b>" + t["Name"] + ".</b> " + t["Desc"] + "<br>";
                    };
                    update["subrace_traits"] = traits_final;
                });
            };
            setCharmancerText(update);
            showChoices(showList);
            setAttrs(reset);
            recalcData();
        });
    }
});

on(changeListeners, function(eventinfo) {
    if(eventinfo.triggerName.search("language") != -1) {
        if(eventinfo.newValue == "custom") {
            showChoices([eventinfo.triggerName + "_custom"]);
        } else if(eventinfo.sourceType != "worker") {
            hideChoices([eventinfo.triggerName + "_custom"]);
        }
    }
    recalcData();
});

on(customLanguageListeners, function(eventinfo) {
    if(eventinfo.sourceType != "worker") {
        recalcData();
    }
});

on("page:l1-class page:l1-race page:l1-abilities page:l1-background", function(eventinfo) {
    recalcData();
});

on("page:l1-welcome", function(eventinfo) {
});

on("mancerchange:class", function(eventinfo) {
    changeCompendiumPage("sheet-class-info", eventinfo.newValue);
    hideChoices();

    var initHide = ["class_possible", "subclass_choices"];
    var reset = {};
    if(!(eventinfo.newValue === "" || eventinfo.newValue === undefined)) {
        showChoices(["classes_options"]);
    }
    var current = recalcData();

    if(eventinfo.sourceType == "player") {
        reset = {subclass: ""};
        reset["class_feature_choice_1_name"] = "";
        reset["class_feature_choice_2_name"] = "";
        reset["class_feature_choice_3_name"] = "";
        reset["subclass_feature_choice_1_name"] = "";
        reset["subclass_feature_choice_2_name"] = "";
        _.each(abilityList, function(ability){
            reset[ability.toLowerCase() + "_save"] = "";
        });
        for(var x=1; x<=proficiencyNum; x++) {
            reset["custom_class_trait_name_" + x] = "";
            reset["custom_class_trait_desc_" + x] = "";
            reset["custom_class_prof_name_choice" + x] = "";
            reset["custom_class_prof_type_choice" + x] = "";
        }
        reset["custom_class_power_ability"] = "";
        reset["custom_class_cantrip_number"] = "0";
        reset["custom_class_power_number"] = "0";
        reset["custom_class_power_list"] = "";
        reset["custom_hit_die"] = "";
        reset["class_name"] = "";
        reset["subclass_name"] = "";
        reset["class_equipment_choice1"] = "";
        reset["class_equipment_choice2"] = "";
        reset["class_equipment_choice3"] = "";
        reset["class_equipment_choice4"] = "";
    }

    if(eventinfo.newValue === "Rules:Classes") {
        //Clears saved data for this field
        getCompendiumPage("");
        setAttrs(reset, function() {
            var update = {"class_text": "", "custom_feature_name": "Class Features"};
            var options = eventinfo.sourceType == "player" ? {selected: ""} : {}
            showChoices(["custom_class"]);
            update["custom_feature_name"] = "Custom Class Features";
            setCharmancerText(update);
            _.each(proficiencyList, function(prof) {
                for(var x=1; x<=proficiencyNum; x++) {
                    var first = true;
                    setCharmancerOptions("class_" + prof.toLowerCase() + "_choice" + x, "Category:Proficiencies Type:" + prof, options, function() {
                        if(first) { first = false; recalcData() }
                    });
                }
            });
        });
    } else {
        getCompendiumPage(eventinfo.newValue, getList, function(p) {
            var update = {};
            var showList = ["class_traits_row"];
            var possibles = ["class_traits"];
            var data = p["data"];
            var hideList = [];
            _.each(proficiencyList, function(type){
                possibles.push("class_" + type.toLowerCase() + "s");
            });
            _.each(possibles, function(key) {
                update[key] = "";
            });

            showList = showList.concat(handleProficiencies(data, "class", eventinfo.sourceType));
            _.each(proficiencyList, function(prof) {
                if(data["data-" + prof + " Proficiency"]) {
                    var json = JSON.parse(data["data-" + prof + " Proficiency"]);
                    if(json.Proficiencies) {
                        update["class_" + prof.toLowerCase() + "s"] = json.Proficiencies.join(", ");
                    }
                }
            });

            if(data["data-Feature Choices"]) {
                var json = JSON.parse(data["data-Feature Choices"]);
                _.each(json, function(feature, num) {
                    var x = num + 1;
                    showList.push("class_feature_row_" + x);
                    if (feature.Values[0] == "Any Language") {
                        setCharmancerOptions("class_feature_choice_" + x, "Category:Proficiencies Type:Language", {category: "Proficiencies", disable: current.proficiencies["language"]});
                    } else {
                        setCharmancerOptions("class_feature_choice_" + x, feature.Values);
                    }
                    update["class_feature_name_" + x] = feature.Name;
                    reset["class_feature_choice_" + x + "_name"] = feature.Name;
                });
            }
            if(eventinfo.sourceType == "player") {
                for(var x = 1; x<=4; x++) {
                    reset["class_feature_choice_" + x] = "";
                }
            }

            if(data["data-Traits"] && data["data-Traits"].length > 0) {
                var traits_final = "";
                var json = JSON.parse(data["data-Traits"]);
                _.each(json, function(t, i) {
                    if(t["Name"] && t["Desc"]) {
                        traits_final = traits_final + "<b>" + t["Name"] + ".</b> " + t["Desc"] + "<br>";
                    };
                    update["class_traits"] = traits_final;
                });
            };

            var class_name = eventinfo.newValue && eventinfo.newValue.split(":").length > 1 && eventinfo.newValue.split(":")[0] === "Classes" ? eventinfo.newValue.split(":")[1] : false;

            if(class_name && data["data-Subclass Level"] == 1) {
                var subOptions = {show_source: true};
                if(eventinfo.sourceType != "player") {
                    subOptions.silent = true;
                } else {
                    subOptions.selected = "";
                }
                update["subclass_prompt"] = "Choose a " + data["Subclass Name"];
                setCharmancerOptions("subclass","Category:Subclasses data-Parent:" + class_name, subOptions, function(values) {
                    if (values.length) showChoices(["subclass"]);
                });
            }
            else {
                hideList.push("subclass");
            }

            if (data["data-Equipment"]) {
                showList.push("class_equipment_row");
                var equipment_string = "";
                var json = JSON.parse(data["data-Equipment"]);
                if(json["default"]) {
                    equipment_string += json["default"].join(", ");
                }
                for (var i = 1; i < 5; i++) {
                    if(json[i]) {
                        if (!json["default"].length && i == 1) {
                            equipment_string += "";
                        } else {
                            equipment_string += " and ";
                        }

                        equipment_string += cleanEquipment(json[i]);
                    }
                };
                update["class_standard_equipment"] = equipment_string;
            }

            setCharmancerText(update);
            showChoices(showList);
            hideChoices(hideList);
            recalcData();
            setAttrs(reset);
        });
    }
});

on("mancerchange:class_feature_choice_1 mancerchange:class_feature_choice_2", function(eventinfo) {
    var data = getCharmancerData();
    var featureNum = _.last( eventinfo.triggerName.split("_") );
    var update = {};
    var set = {};
    set["class_feature_choice_" + featureNum + "_desc"] = "";
    if(eventinfo.newValue) {
        getCompendiumPage(data["l1-class"].values.class, function(p) {
            var data = p["data"];
            if(data["data-Feature Choices"]) {
                var feature = JSON.parse(data["data-Feature Choices"])[featureNum-1];
                var featureName = feature.Name;
                var offset = 3;

                if (eventinfo.newValue.split("~")[1] && eventinfo.newValue.split("~")[1] == "DBL") {
                    showChoices(["class_feature_row_" + featureNum + "_manual"]);
                    // var doubleChoiceNum = featureNum + offset;
                    // setCharmancerOptions("class_feature_choice_" + doubleChoiceNum, [eventinfo.newValue]);
                } else {
                    hideChoices(["class_feature_row_" + featureNum + "_manual"]);
                }
                if(data["data-" + featureName + " Data"]) {
                    var json = JSON.parse(data["data-" + featureName + " Data"]);
                    var selected = _.findWhere(json, {Name: eventinfo.newValue});
                    if(selected) {
                        update["class_feature_description_" + featureNum] = selected.Desc;
                        set["class_feature_choice_" + featureNum + "_desc"] = selected.Desc;
                        setAttrs(set);
                        setCharmancerText(update);
                    }
                }
            }
        });
    } else {
        update["class_feature_description_" + featureNum] = "";
        setAttrs(set);
        setCharmancerText(update);
    }
});

on("mancerchange:subclass", function(eventinfo) {
    changeCompendiumPage("sheet-class-info", eventinfo.newValue);

    var initHide = ["subclass_possible"];
    var reset = {};
    if(eventinfo.newValue === "" || eventinfo.newValue === undefined) {
        initHide.push("subclass_options");
        initHide.push("custom_subclass");
    }
    else {
        showChoices(["subclass_options"]);
        if(eventinfo.newValue === "Rules:Classes") {
            showChoices(["custom_subclass"]);
        }
        else {
            initHide.push("custom_subclass");
        }
    }
    hideChoices(initHide);
    var current = recalcData();

    if(eventinfo.sourceType == "player") {
        reset["subclass_feature_choice_1_name"] = "";
        reset["subclass_feature_choice_2_name"] = "";
        for(var x=1; x<=proficiencyNum; x++) {
            reset["custom_class_trait_name_" + x] = "";
            reset["custom_class_trait_desc_" + x] = "";
            reset["custom_class_prof_name_choice" + x] = "";
            reset["custom_class_prof_type_choice" + x] = "";
        }
        reset["custom_class_power_ability"] = "";
        reset["custom_class_cantrip_number"] = "0";
        reset["custom_class_power_number"] = "0";
        reset["custom_class_power_list"] = "";
        reset["custom_subclass_cantrip_number"] = "0";
        reset["custom_subclass_cantrip_list"] = "";
        reset["custom_subclass_power_number"] = "0";
        reset["custom_subclass_power_list"] = "";
        reset["subclass_name"] = "";
    }

    if(eventinfo.newValue === "Rules:Classes") {
        //Clears saved data for this field
        getCompendiumPage("");
        setAttrs(reset, function() {
            var mancerdata = getCharmancerData();
            var update = {"subclass_text": ""};
            var options = eventinfo.sourceType == "player" ? {selected: ""} : {};
            var subclassname = mancerdata["l1-class"].data.class["Subclass Name"];
            showChoices(["custom_subclass"]);
            if(mancerdata["l1-class"].data.class && mancerdata["l1-class"].data.class["Powercasting Ability"]) {
                showChoices(["custom_additional_powers"]);
            } else {
                showChoices(["custom_class_powers"]);
            }
            update["custom_feature_name"] = "Custom " + subclassname + " Features";
            update["custom_subclass_name"] = "Custom " + subclassname + " Name";
            setCharmancerText(update);
            _.each(proficiencyList, function(prof) {
                for(var x=1; x<=proficiencyNum; x++) {
                    var first = true;
                    setCharmancerOptions("subclass_" + prof.toLowerCase() + "_choice" + x,
                        "Category:Proficiencies Type:" + prof, options, function() {
                            if(first) { first = false; recalcData(); }
                        });
                }
            });
        });
    } else {
        hideChoices(["custom_subclass"]);
        getCompendiumPage(eventinfo.newValue, getList, function(p) {
            var update = {};
            var showList = [];
            var possibles = ["subclass_traits"];
            var data = p["data"];
            var hideList = [];
            _.each(proficiencyList, function(type){
                possibles.push("subclass_" + type.toLowerCase() + "s");
            });
            _.each(possibles, function(key) {
                update[key] = "";
            });

            showList = showList.concat(handleProficiencies(data, "subclass", eventinfo.sourceType));
            _.each(proficiencyList, function(prof) {
                if(data["data-" + prof + " Proficiency"]) {
                    var json = JSON.parse(data["data-" + prof + " Proficiency"]);
                    if(json.Proficiencies) {
                        update["subclass_" + prof.toLowerCase() + "s"] = json.Proficiencies.join(", ");
                    }
                }
            });

            if(data["data-Feature Choices"]) {
                var json = JSON.parse(data["data-Feature Choices"]);
                _.each(json, function(feature, num) {
                    var x = num + 1;
                    showList.push("subclass_feature_row_" + x)
                    setCharmancerOptions("subclass_feature_choice_" + x, feature.Values);
                    update["subclass_feature_name_" + x] = feature.Name;
                    reset["subclass_feature_choice_" + x + "_name"] = feature.Name;
                });
            }
            if(eventinfo.sourceType == "player") {
                for(var x = 1; x<=4; x++) {
                    reset["subclass_feature_choice_" + x] = "";
                }
            }

            if(data["data-Traits"] && data["data-Traits"].length > 0) {
                var traits_final = "";
                var json = JSON.parse(data["data-Traits"]);
                _.each(json, function(t, i) {
                    if(t["Name"] && t["Desc"]) {
                        traits_final = traits_final + "<b>" + t["Name"] + ".</b> " + t["Desc"] + "<br>";
                    };
                    update["subclass_traits"] = traits_final;
                });
            };

            setCharmancerText(update);

            showChoices(showList);
            hideChoices(hideList);
            recalcData();
            setAttrs(reset);
        });
    }
});

on("mancerchange:custom_subclass_cantrip_number mancerchange:custom_subclass_power_number", function(eventinfo) {
    var section = eventinfo.triggerName.split("_")[2];
    if(eventinfo.newValue && eventinfo.newValue > 0) {
        showChoices(["custom_" + section + "_list"]);
    } else {
        var reset = {};
        reset["custom_subclass_" + section + "_list"] = "";
        hideChoices(["custom_" + section + "_list"]);
        setAttrs(reset);
    }
});

var costOfScore = function(score) {
    if (isNaN(score) || score == 8) {
        return 0;
    }
    var cost = 0;
    if (score > 8) {
        if (score < 14) {
            cost = score - 8;
        } else if (score == 14) {
            cost = 7;
        } else if (score == 15) {
            cost = 9;
        } else {  // Score should never be higher, but let's cover our bases.
            cost = 11;
        }
    }
    return cost;
};

var recalcPoints = function() {
    data = getCharmancerData();
    var attribs = ["strength","dexterity","constitution","intelligence","wisdom","charisma"];
    var maxPoints = 27;

    var scores = {};

    _.each(attribs, function(attrib) {
        scores[attrib] = parseInt(data["l1-abilities"].values[attrib]);
        if (isNaN(scores[attrib])) {
            scores[attrib] = 8;
        }
    });

    var pointsAvailable = maxPoints;

    // Decrement points based on selected attribs
    _.each(scores, function(score) {
        if (!isNaN(score)) {
            var cost = costOfScore(score);
            pointsAvailable -= cost;
        }
    });

    // Disable options if points are below a threshold.
    if (pointsAvailable < 9) {
        var choicesToDisable = ["15","14","13","12","11","10","9"];

        _.each(attribs, function(attrib) {
            var toDisableForThisAttrib = []
            _.each(choicesToDisable, function(choice) {
                if (scores[attrib] <= Number(choice) && (costOfScore(scores[attrib]) + pointsAvailable < costOfScore(Number(choice)))) {
                    toDisableForThisAttrib.push(choice);
                }
            });
            disableCharmancerOptions(attrib, toDisableForThisAttrib);
        });
    } else {
        _.each(attribs, function(attrib) {
            disableCharmancerOptions(attrib, []);
        });
    }

    _.each(attribs, function(attrib) {
        setCharmancerText({"points_available_display":String(pointsAvailable)});
    });

    return String(pointsAvailable);
};

on("page:l1-abilities", function(eventinfo) {
    var data = getCharmancerData();
    getCompendiumPage("Rules:Ability%20Scores", getList, function(p) {
        var pagedata = p["data"];
        var allChoices = [];
        if (pagedata["data-Generation Choices"]) {
            var genChoices = JSON.parse(pagedata["data-Generation Choices"]);
            _.each(genChoices, function(value, choice) {
                allChoices.push(choice);
            });
        }
        setCharmancerOptions("abilities", allChoices);


        if (data["l1-abilities"] && data["l1-abilities"].values && data["l1-abilities"].values.abilities) {
            setAttrs({"abilities": data["l1-abilities"].values.abilities});
        }
    });
})

on("mancerchange:abilities", function(eventinfo) {
    var data = getCharmancerData();
    var initHide = ["abilities_possible"];
    var attribs = ["strength","dexterity","constitution","intelligence","wisdom","charisma"];
    var standardArray = ["8", "10", "12", "13", "14", "15"];
    var pointbuyChoices = ["8", "9", "10", "11", "12", "13", "14", "15"];

    hideChoices(initHide);


    if (data["l1-abilities"].values.abilities == "Standard Array") {
        showChoices(["abilities_stdarray", "abilities_selects"]);
        _.each(attribs, function(attrib) {
            setCharmancerOptions(attrib, standardArray);
        });
    }

    if (data["l1-abilities"].values.abilities == "Roll for Stats") {
        showChoices(["abilities_rollstats"]);
        if (data["l1-abilities"].values.roll_results && data["l1-abilities"].values.roll_results.length) {
            showChoices(["abilities_selects"]);
            var roll_results = typeof data["l1-abilities"].values.roll_results == "string" ? data["l1-abilities"].values.roll_results.split(",") : data["l1-abilities"].values.roll_results;
            _.each(attribs, function(attrib) {
                setCharmancerOptions(attrib, roll_results);
            });
        }
    }

    if (data["l1-abilities"].values.abilities == "Point Buy") {
        showChoices(["abilities_pointbuy", "abilities_selects"]);
        setCharmancerText({"points_available_display":data["l1-abilities"].values.pointbuy_points || "27"});
        _.each(attribs, function(attrib) {
            setCharmancerOptions(attrib, pointbuyChoices);
        });
    }

    if (data["l1-abilities"].values.abilities == "custom") {
        showChoices(["abilities_custom"]);
    }

    reset = {};
    if (eventinfo.sourceType == "player") {
        _.each(attribs, function(attrib) {
            reset[attrib] = "";
        });
        reset["pointbuy_points"] = "27"
    }


    recalcData();
    setAttrs(reset);
});

on("mancerchange:strength mancerchange:dexterity mancerchange:constitution mancerchange:intelligence mancerchange:wisdom mancerchange:charisma", function(eventinfo) {
    data = getCharmancerData();
    var attribs = ["strength","dexterity","constitution","intelligence","wisdom","charisma"];
    var clearvalue = eventinfo.newValue;
    var clearObject = {
        strength: data["l1-abilities"].values.strength,
        dexterity: data["l1-abilities"].values.dexterity,
        constitution: data["l1-abilities"].values.constitution,
        intelligence: data["l1-abilities"].values.intelligence,
        wisdom: data["l1-abilities"].values.wisdom,
        charisma: data["l1-abilities"].values.charisma};

    if (data["l1-abilities"].values.abilities != "custom" && data["l1-abilities"].values.abilities != "Point Buy") {
        attribs = _.reject(attribs, function(item) { return item == eventinfo.triggerName; });
        _.each(attribs, function(attrib) {
            if (clearvalue == clearObject[attrib]) {
                clearObject[attrib] = "";
            }
        });
    }

    if (data["l1-abilities"].values.abilities == "Point Buy") {
        clearObject.pointbuy_points = recalcPoints();
    }

    if (eventinfo.sourceType == "player") {
        setAttrs(clearObject);
    }
    recalcData();
});

on("mancerroll:rollstats", function(eventinfo) {
    var attribs = ["strength","dexterity","constitution","intelligence","wisdom","charisma"];
    var results = [];
    var i = 1;
    _.each(eventinfo.roll, function(roll) {
        results.push(roll.result + "~" + i);
        i++;
    });
    results.sort(function(a,b) {return Number(a.split("~")[0]) - Number(b.split("~")[0])});
    _.each(attribs, function(attrib) {
        setCharmancerOptions(attrib, results);
    });
    setAttrs({roll_results: results, strength: "", dexterity: "", constitution: "", intelligence: "", wisdom: "", charisma: ""});
    showChoices(["abilities_selects"]);
});

on("clicked:clearstats", function(eventinfo) {
    var data = getCharmancerData();
    var attribs = ["strength","dexterity","constitution","intelligence","wisdom","charisma"];
    reset = {};
    _.each(attribs, function(attrib) {
        reset[attrib] = "";
        disableCharmancerOptions(attrib, []);
    });

    setAttrs(reset);
});

on("clicked:info_race", function(eventinfo) {
    var data = getCharmancerData();
    var race = data["l1-race"] && data["l1-race"].values.race ? data["l1-race"].values.race : "Rules:Races";
    changeCompendiumPage("sheet-race-info", race);
});

on("clicked:info_subrace", function(eventinfo) {
    var data = getCharmancerData();
    var subrace = data["l1-race"] && data["l1-race"].values.subrace ? data["l1-race"].values.subrace : data["l1-race"].values.race;
    changeCompendiumPage("sheet-race-info", subrace);
});

on("clicked:info_class", function(eventinfo) {
    var data = getCharmancerData();
    var oclass = data["l1-class"] && data["l1-class"].values.class ? data["l1-class"].values.class : "Rules:Classes";
    changeCompendiumPage("sheet-class-info", oclass);
});

on("clicked:info_subclass", function(eventinfo) {
    var data = getCharmancerData();
    var osubclass = data["l1-class"] && data["l1-class"].values.subclass ? data["l1-class"].values.subclass : data["l1-class"].values.class;
    changeCompendiumPage("sheet-class-info", osubclass);
});

on("clicked:powerinfo_race_level0_choice1 clicked:powerinfo_race_level0_choice2 clicked:powerinfo_race_level0_choice3 clicked:powerinfo_race_level1_choice1 clicked:powerinfo_race_level1_choice2 clicked:powerinfo_race_level1_choice3 clicked:powerinfo_class_level0_choice1 clicked:powerinfo_class_level0_choice2 clicked:powerinfo_class_level0_choice3 clicked:powerinfo_class_level0_choice4 clicked:powerinfo_class_level0_choice5 clicked:powerinfo_class_level0_choice6 clicked:powerinfo_class_level1_choice1 clicked:powerinfo_class_level1_choice2 clicked:powerinfo_class_level1_choice3 clicked:powerinfo_class_level1_choice4 clicked:powerinfo_class_level1_choice5 clicked:powerinfo_class_level1_choice6 clicked:powerinfo_class_level1_choice7 clicked:powerinfo_class_level1_choice8 clicked:powerinfo_class_level1_choice9", function(eventinfo) {
    var select_name = eventinfo.triggerName.substring(18);
    var data = getCharmancerData();
    var power_name = data["l1-powers"] && data["l1-powers"].values[select_name] ? data["l1-powers"].values[select_name] : "Rules:Powers";
    console.log(power_name);
    changeCompendiumPage("sheet-powers-info", power_name, "card_only");
});

on("mancerchange:background", function(eventinfo) {
    changeCompendiumPage("sheet-background-info", eventinfo.newValue);

    var initHide = ["background_possible", "custom_background"];
    var reset = {};
    if(eventinfo.newValue === "" || eventinfo.newValue === undefined) {
        initHide.push("backgrounds_options");
    }
    else {
        showChoices(["backgrounds_options"]);
    }
    hideChoices(initHide);
    var current = recalcData();

    if(eventinfo.sourceType == "player") {
        reset = {};
        for(var x=0; x<=4; x++) {
            reset["background_skill_choice" + x] = "";
            reset["background_tool_choice" + x] = "";
            reset["background_language_choice" + x] = "";
        }
        reset["background_detail_choice"] = "";
        reset["background_personality_choice1"] = "";
        reset["background_personality_choice2"] = "";
        reset["background_ideal_choice"] = "";
        reset["background_bond_choice"] = "";
        reset["background_flaw_choice"] = "";
        reset["custom_background_trait_name"] = "";
        reset["custom_background_trait_desc"] = "";
    }

    if(eventinfo.newValue === "Rules:Backgrounds") {
        //Clears saved data for this field
        getCompendiumPage("");
        setAttrs(reset, function() {
            var update = {"background_text": ""};
            var options = eventinfo.sourceType == "player" ? {selected: ""} : {}
            showChoices(["custom_background"]);
            setCharmancerText(update);
            _.each(proficiencyList, function(prof) {
                for(var x=1; x<=proficiencyNum; x++) {
                    var first = true;
                    setCharmancerOptions("background_" + prof.toLowerCase() + "_choice" + x, "Category:Proficiencies Type:" + prof, options, function() { if(first) { first = false; recalcData() } });
                }
            });
        });
    } else {
        getCompendiumPage(eventinfo.newValue, getList, function(p) {
            var update = {};
            var showList = [];
            var possibles = ["background_feature"];
            var data = p["data"];
            var hideList = [];
            var setRollButton = function(name, data, title) {
                var set = {};
                title = title || name.split("_")[1];
                title = title[0].toUpperCase() + title.substring(1);
                if(title == "Personality") title += " Trait"
                set["roll_" + name + "_roll"] = "&{template:mancerroll} {{title=" + title + "}} {{r1=[[1d" + data.length + "]]}}";
                set[name + "_array"] = JSON.stringify({name: title, array: data});
                setAttrs(set);
            };

            _.each(proficiencyList, function(type){
                possibles.push("background_" + type.toLowerCase() + "s");
            });
            _.each(possibles, function(key) {
                update[key] = "";
            });

            showList = showList.concat(handleProficiencies(data, "background", eventinfo.sourceType));
            _.each(proficiencyList, function(prof) {
                if(data["data-" + prof + " Proficiency"]) {
                    var json = JSON.parse(data["data-" + prof + " Proficiency"]);
                    if(json.Proficiencies) {
                        update["background_" + prof.toLowerCase() + "s"] = json.Proficiencies.join(", ");
                    }
                }
            });

            if (data["data-Background Choices"] && data["data-Background Choices"] != "") {
                showList.push("background_detail_choice_row");
                var choices = JSON.parse(data["data-Background Choices"]);
                showList.push("background_detail_choice");
                setCharmancerOptions("background_detail_choice", choices, {}, function(opts) {
                    setRollButton("background_detail_choice", opts, data["data-Background Choice Name"]);
                });
                update["background_detail_choice_name"] = data["data-Background Choice Name"];
            }
            if(eventinfo.sourceType == "player") {
                reset["background_detail_choice"] = "";
            }

            if (data["data-Personality Traits"]) {
                showList.push("background_personality_row");
                var choices = JSON.parse(data["data-Personality Traits"]);
                setCharmancerOptions("background_personality_choice1", choices, {}, function(opts) {
                    setRollButton("background_personality_choice1", opts);
                });
                setCharmancerOptions("background_personality_choice2", choices, {}, function(opts) {
                    setRollButton("background_personality_choice2", opts);
                });
                showList.push("background_personality_choice1");
                showList.push("background_personality_choice2");
            }
            if (data["data-Ideals"]) {
                var choices = JSON.parse(data["data-Ideals"]);
                setCharmancerOptions("background_ideal_choice", choices, {}, function(opts) {
                    setRollButton("background_ideal_choice", opts);
                });
                showList.push("background_ideal_choice");
            }
            if (data["data-Bonds"]) {
                var choices = JSON.parse(data["data-Bonds"]);
                setCharmancerOptions("background_bond_choice", choices, {}, function(opts) {
                    setRollButton("background_bond_choice", opts);
                });
                showList.push("background_bond_choice");
            }
            if (data["data-Flaws"]) {
                var choices = JSON.parse(data["data-Flaws"]);
                setCharmancerOptions("background_flaw_choice", choices, {}, function(data) {
                    setRollButton("background_flaw_choice", data);
                });
                showList.push("background_flaw_choice");
            }

            if(eventinfo.sourceType == "player") {
                reset = _.extend(reset, {"background_personality_choice1": "", "background_personality_choice2": "", "background_ideal_choice": "", "background_bond_choice": "", "background_flaw_choice": ""});
            }

            if (data["data-Equipment"]) {
                showList.push("background_equipment_row");
                var equipment_string = "";
                var json = JSON.parse(data["data-Equipment"]);
                if(json["default"]) {
                    equipment_string += json["default"].join(", ");
                }
                for (var i = 1; i < 5; i++) {
                    if(json[i]) {
                        if (!json["default"].length && i == 1) {
                            equipment_string += "";
                        } else {
                            equipment_string += " and ";
                        }

                        equipment_string += cleanEquipment(json[i]);
                    }
                };
                update["background_standard_equipment"] = equipment_string;
            }

            if(data["data-Feature Name"] && data["data-Feature Name"].length > 0) {
                update["background_feature"] = "<b>" + data["data-Feature Name"] + ".</b>";
                update["background_feature_description"] = data["data-Feature Description"];
                showList = showList.concat(["background_feature_row", "background_feature", "background_feature_description"]);
            };

            var background_name = eventinfo.newValue && eventinfo.newValue.split(":").length > 1 && eventinfo.newValue.split(":")[0] === "Backgrounds" ? eventinfo.newValue.split(":")[1] : false;

            setCharmancerText(update);
            showChoices(showList);
            hideChoices(hideList);
            recalcData();
            setAttrs(reset);
        });
    }
});

on("mancerchange:background_personality_choice1 mancerchange:background_personality_choice2", function(eventinfo) {
    var mancerdata = getCharmancerData();
    var choices = [];
    if(mancerdata["l1-background"].values["background_personality_choice1"]) choices.push(mancerdata["l1-background"].values["background_personality_choice1"]);
    if(mancerdata["l1-background"].values["background_personality_choice2"]) choices.push(mancerdata["l1-background"].values["background_personality_choice2"]);
    disableCharmancerOptions("background_personality_choice1", choices);
    disableCharmancerOptions("background_personality_choice2", choices);
});

on("mancerroll:background_detail_choice_roll mancerroll:background_personality_choice1_roll mancerroll:background_personality_choice2_roll mancerroll:background_ideal_choice_roll mancerroll:background_bond_choice_roll mancerroll:background_flaw_choice_roll", function(eventinfo) {
    var data = getCharmancerData();
    var index = eventinfo.roll[0].dice[0] - 1;
    var baseName = eventinfo.triggerName.split(":")[1].slice(0,-5);
    var choices = JSON.parse(data["l1-background"].values[baseName + "_array"]);
    setCharmancerOptions(baseName, choices.array, {selected: choices.array[index]});
    if(baseName.slice(0, -1) == "background_personality_choice") {
        var num = baseName.substr(-1) == "1" ? "2" : "1";
        var set = {};
        set["roll_" + baseName.slice(0, -1) + num + "_roll"] = "&{template:mancerroll} {{title=" + choices.name + "}} {{r1=[[1d" + choices.array.length + "r" + (index + 1) + "]]}}";
        setAttrs(set);
    }
});

on("page:l1-equipment", function(eventinfo) {
    var data = getCharmancerData();
    var class_string = getName("class", data, true);
    var background_string = getName("background", data, true);
    var class_equipment = data && data["l1-equipment"] && data["l1-equipment"].values.equipment_class ? data["l1-equipment"].values.equipment_class : undefined;
    var background_equipment = data && data["l1-equipment"] && data["l1-equipment"].values.equipment_background ? data["l1-class"].values.equipment_background : undefined;
    var update = {};
    var update_attr = {};
    var showList = [];
    var hideList = [];
    var equipmentType = data["l1-equipment"] && data["l1-equipment"].values.equipment_type ? data["l1-equipment"].values.equipment_type : "";
    var handleChoices = function(type) {
        var equipment = {};
        if(data["l1-" + type] && data["l1-" + type].data[type] && data["l1-" + type].data[type]["data-Equipment"]) {
            equipment = data["l1-" + type].data[type]["data-Equipment"];
        };
        _.each(equipment, function(feature, num) {
            if(num === "default") {
                update[type + "_equipment"] = feature.join(", ");
            } else {
                var dynamic_items = "Category:None";
                var static_items = [];
                var hasDouble = false;
                var doubleOffset = 4;

                _.each(feature, function(f) {
                    if(f.indexOf("Subtype:") > -1) {
                        dynamic_items = 'Category:Items "Item Rarity":Standard ' + f.split("~")[0];
                    } else if (f.indexOf("*Weapon") > -1) {
                        dynamic_items = 'Category:Items "Item Rarity":Standard ' + f.split("~")[0];
                    } else {
                        static_items.push(f);
                    }
                    if (f.split("~")[1] && f.split("~")[1] == "DBL") {
                        hasDouble = true;
                    }
                });
                if (hasDouble) {
                    showList.push(type + "_equipment_choice" + num + "_double");
                    var doubleChoiceNum = parseInt(num) + doubleOffset;
                    setCharmancerOptions(type + "_equipment_choice" + doubleChoiceNum, dynamic_items, {add:static_items, category:"Items"});
                } else {
                    hideList.push(type + "_equipment_choice" + num + "_double");
                }
                setCharmancerOptions(type + "_equipment_choice" + num, dynamic_items, {add: static_items, category:"Items"});
                showList.push(type + "_equipment_choice" + num);
            }
        });
    };

    recalcData();

    if(class_string) {
        showList.push("has_class");
        update["class_label"] = class_string;
        update_attr["equipment_class"] = class_string;
        if(class_equipment && class_equipment != class_string) {
            update["starting_gold_btn_label"] = "";
            update["class_equipment"] = "";
            update_attr["starting_gold"] = 0;
            update_attr["equipment_type"] = "";
            equipmentType = "";
            update_attr["class_equipment_choice1"] = "";
            update_attr["class_equipment_choice2"] = "";
            update_attr["class_equipment_choice3"] = "";
            update_attr["class_equipment_choice4"] = "";
        };

        if(class_string == "custom") {
            update_attr["equipment_type"] = "gold";
            hideList.push("equipment_type", "random_gold_option")
            showList.push("custom_class_gold", "gold_option", "eqp_custom_class");
        } else {
            handleChoices("class");
            var startingGold = data["l1-class"].data.class && data["l1-class"].data.class["Starting Gold"] ? data["l1-class"].data.class["Starting Gold"] : false;
            if(startingGold) {
                update["starting_gold_btn_label"] = startingGold;
                update_attr["roll_starting_gold"] = "&{template:mancerroll} {{title=Starting Gold}} {{r1=[[" + startingGold.replace("x", "*") + "]]}}";
                showList.push("random_gold_option");
            } else {
                update_attr["roll_starting_gold"] = "&{template:mancerroll} {{title=Starting Gold}} {{r1=[[0]]}}";
                update_attr["equipment_type"] = "class";
                equipmentType = "class";
                hideList.push("equipment_type", "gold_option");
                showList.push("class_option", "no_gold_option");
            }
        }
    } else {
        showList.push("no_class");
    };

    if(background_string) {
        update["background_label"] = background_string;
        update_attr["equipment_background"] = background_string;
        if(background_string != "custom") {
            handleChoices("background");
        }
        if(data["l1-equipment"] && data["l1-equipment"].values.equipment_type || class_string == "custom") {
            if(data["l1-equipment"] && equipmentType == "class" || class_string == "custom") {
                showList.push("has_background");
                if(background_equipment && background_equipment != background_string) {
                    update["background_equipment"] = "";
                    update_attr["background_equipment_choice1"] = "";
                    update_attr["background_equipment_choice2"] = "";
                    update_attr["background_equipment_choice3"] = "";
                    update_attr["background_equipment_choice4"] = "";
                };
            }
            if(data["l1-equipment"] && equipmentType == "gold" && class_string != "custom") {
                showList.push("background_chose_starting_gold");
            }
        }
    } else {
        showList.push("no_background");
    }

    if(equipmentType === "" || equipmentType === undefined) {
        hideList.push("gold_option", "class_option");
    } else if(equipmentType === "gold") {
        if(background_string) showList.push("background_gold_option");
        showList.push("gold_option");
        hideList.push("class_option");
    } else if(equipmentType === "class") {
        showList.push("class_option");
        hideList.push("gold_option");
    }

    showChoices(showList);
    hideChoices(hideList);
    setCharmancerText(update);
    setAttrs(update_attr);
});

on("mancerchange:equipment_type", function(eventinfo) {
    var showList = [];
    var hideList = [];
    var update = {};
    var reset = {};
    var data = getCharmancerData();
    var class_string = getName("class", data, true);
    var background_string = getName("background", data, true);
    var class_equipment = data && data["l1-equipment"] && data["l1-equipment"].values.equipment_class ? data["l1-equipment"].values.equipment_class : undefined;
    var background_equipment = data && data["l1-equipment"] && data["l1-equipment"].values.equipment_background ? data["l1-class"].values.equipment_background : undefined;

    if(eventinfo.sourceType == "player") {
        if(eventinfo.newValue === "" || eventinfo.newValue === undefined) {
            hideList.push("gold_option", "class_option", "background_gold_option");
        } else if(eventinfo.newValue === "gold") {
            if(background_string) showList.push("background_gold_option");
            if(class_string != "custom") showList.push("random_gold_option")
            showList.push("gold_option");
            hideList.push("class_option");
        } else if(eventinfo.newValue === "class") {
            showList.push("class_option");
            hideList.push("gold_option", "background_gold_option");
        }
    }

    showChoices(showList);
    hideChoices(hideList);
});

on("mancerroll:starting_gold", function(eventinfo) {
    setAttrs({starting_gold: eventinfo.roll[0].result});
});

on("clicked:cancel", function() {
    showChoices(["cancel-prompt"]);
    console.log(getCharmancerData());
    console.log(recalcData());
});

on("clicked:continue", function() {
    hideChoices(["cancel-prompt"]);
});

on("page:l1-powers", function(eventinfo) {
    var stats = recalcData();
    var mancerdata = getCharmancerData();
    var powerData = knownPowers();
    var showList = [];
    var hideList = [];
    var set = {};
    var update = {};
    var racename = getName("race", mancerdata, true);
    var subracename = getName("subrace", mancerdata, true);
    var classname = getName("class", mancerdata, true);
    var subclassname = getName("subclass", mancerdata, true);
    var levelTracker = {"race": {"0":1, "1":1}, "class": {"0":1, "1":1}};

    set["race_powers"] = racename + subracename;
    set["class_powers"] = classname + subclassname;
    set["race_number"] = powerData.race ? powerData.race.choices.length : 0;
    set["class_number"] = powerData.class ? powerData.class.choices.length : 0;

    subracename = getName("subrace", mancerdata) == "" ? "" : " - " + getName("subrace", mancerdata);
    subclassname = getName("subclass", mancerdata) == "" ? "" : " - " + getName("subclass", mancerdata);
    setAttrs(set, function() {
        powerData = knownPowers();
        if(powerData.race) update["race_title"] = getName("race", mancerdata) + subracename;
        if(powerData.class) update["class_title"] = getName("class", mancerdata) + subclassname;

        _.each(["race", "class"], function(section) {
            if(powerData[section]) {
                showList.push(section + "_row");
                for(var x=0; x<=1; x++) {
                    var knownArray = _.pluck(_.where(powerData[section].known, {Level:x}), "Name");
                    if(knownArray.length > 0) {
                        showList.push(section + "_level" + x);
                        update[section + "_level" + x + "_known"] = knownArray.join(", ");
                    }
                }
                _.each(powerData[section].choices, function(choice) {
                    var powerNumber = levelTracker[section][choice.Level];
                    var choiceName = section + "_level" + choice.Level + "_choice" + powerNumber;
                    levelTracker[section][choice.Level]++;
                    showList.push(section + "_level" + choice.Level);
                    showList.push(choiceName);
                    set[choiceName + "_casting"] = choice.Ability;
                    var options = {category: "Powers", disable: powerData.known, show_source: true};
                    if(choice["Expanded List"]) {
                        options.add = choice["Expanded List"];
                    }
                    var selects = choice.List;
                    if(typeof choice.List == "string") {
                        selects = "Category:Powers Classes:*" + choice.List + " Level:" + choice.Level;
                    }
                    setCharmancerOptions(choiceName, selects, options)
                });
            }
        });

        _.each(levelTracker, function(tracker, section) {
            var previousPowers = mancerdata["l1-powers"] && mancerdata["l1-powers"].values[section + "_powers"] ? mancerdata["l1-powers"].values[section + "_powers"] : "";
            if(previousPowers != set[section + "_powers"]) tracker = {"0":1, "1":1}
            _.each(tracker, function(number, level) {
                for(var x = number; x <= 9; x++) {
                    set[section + "_level" + level + "_choice" + x] = "";
                }
            })
        });

        showList = _.uniq(showList);

        if (!powerData.race && !powerData.class) {
            showList.push("no_powers");
            hideList.push("yes_powers");
        } else {
            showList.push("power-info-container");
            hideList.push("no_powers");
        }

        setCharmancerText(update);
        showChoices(showList);
        hideChoices(hideList);
        setAttrs(set);
    });
});

on("page:l1-feat", function(eventinfo) {
    var stats = recalcData();
    var mancerdata = getCharmancerData();
    var showList = [];
    var hideList = [];

    if(mancerdata["l1-race"] && mancerdata["l1-race"].data.subrace && mancerdata["l1-race"].data.subrace["data-Feats"]) {
        showList = ["yes_feat"];
        hideList = ["no_feat"];
    } else {
        hideList = ["yes_feat"];
        showList = ["no_feat"];
        deleteCharmancerData(["l1-feat"]);
    }

    showChoices(showList);
    hideChoices(hideList);
});

on("mancerchange:feat", function(eventinfo) {
    changeCompendiumPage("sheet-feat-info", eventinfo.newValue);

    var reset = {};
    if(!(eventinfo.newValue === "" || eventinfo.newValue === undefined)) {
        showChoices(["feat_options"]);
    }
    hideChoices(["feat_possible"]);

    if(eventinfo.sourceType == "player") {
        reset = {};
        for(var x=1; x<=proficiencyNum; x++) {
            //reset["custom_race_prof_name_choice" + x] = "";
            //reset["custom_race_prof_type_choice" + x] = "";
        }
        reset["feat_ability_choice"] = "";
        setCharmancerText({"feat_text": ""});
    }

    getCompendiumPage(eventinfo.newValue, getList, function(p) {
        setAttrs(reset, function() {
            var mancerdata = getCharmancerData();
            var data = p["data"];
            var showList = [];
            var update = {};

            if(data["data-Ability Score Increase"]) {
                var abilityText = [];
                var json = JSON.parse(data["data-Ability Score Increase"]);
                _.each(json, function(increase, ability) {
                    abilityText.push(ability + " +" + increase);
                });
                update["feat_ability_score"] = abilityText.join(", ");
                showList.push("feat_ability");
            }

            if(data["data-Ability Score Choice"]) {
                var json = JSON.parse(data["data-Ability Score Choice"]);
                setCharmancerOptions("feat_ability_choice", json);
                showList.push("feat_ability", "feat_ability_choice");
            }

            if(data["Prerequisite"]) {
                showList.push("feat_prereq")
                update["feat_prerequisite"] = data["Prerequisite"];
            }
            //feat_ability_choice

            setCharmancerText(update);
            showChoices(showList);
            recalcData();
        });
    });

});

on(powerListeners, function(eventinfo) {
    if(eventinfo.sourceType == "player") {
        changeCompendiumPage("sheet-powers-info", eventinfo.newValue, "card_only");
    }

    var mancerdata = getCharmancerData();
    var known = knownPowers().known;

    for(var x = 1; x<=9; x++) {
        disableCharmancerOptions("race_level0_choice" + x, known, {category: "Powers"});
        disableCharmancerOptions("race_level1_choice" + x, known, {category: "Powers"});
        disableCharmancerOptions("class_level0_choice" + x, known, {category: "Powers"});
        disableCharmancerOptions("class_level1_choice" + x, known, {category: "Powers"});
    }
});

on("page:l1-summary", function() {
    var recalc = recalcData();
    var mancerdata = getCharmancerData();
    var set = {};
    var racename = getName("race", mancerdata);
    var subracename = getName("subrace", mancerdata);
    var classname = getName("class", mancerdata);
    var subclassname = getName("subclass", mancerdata);
    var bgname = getName("background", mancerdata);
    var powerdata = knownPowers();
    var racePowers = powerdata.race ? powerdata.race.choices.length : 0;
    var classPowers = powerdata.class ? powerdata.class.choices.length : 0;
    var ready = true;

    var handleMissing = function(section, sectionName) {
        var page = mancerdata["l1-" + section.replace("sub", "")] || false;
        var missing = {};
        var warnings = "";
        sectionName = sectionName || section;
        if(page && page.data && page.data[section]) {
            _.each(proficiencyList, function(prof) {
                if(page.data[section]["data-" + prof + " Proficiency"]) {
                    var numChoices = 0;
                    var totalChoices = 0;
                    for(var x=0; x<=proficiencyNum; x++) {
                        if(page.data[section]["data-" + prof + " Proficiency"]["Choice " + x]) {
                            numChoices++;
                            totalChoices++;
                        };
                        if(page.values[section + "_" + prof.toLowerCase() + "_choice" + x]) {
                            numChoices--;
                            var thischoice = _.last(page.values[section + "_" + prof.toLowerCase() + "_choice" + x].split(":"));
                            _.each(recalc.proficiencies.auto, function(profs, source) {
                                if(profs.includes(thischoice)) {
                                    warnings += '<p class="sheet-warning">You\'ve chosen the ' + prof.toLowerCase() + ' ' + thischoice;
                                    warnings += ', but you already have that ' + prof.toLowerCase() + ' from your ' + source + '.</p>';
                                };
                            });
                        }
                    }
                    if(numChoices > 0) missing[prof] = [totalChoices, numChoices];
                }
            });
            if(page.data[section]["data-Ability Score Choice"]) {
                var choices = 1;
                if(typeof page.data[section]["data-Ability Score Choice"] == "string") {
                    choices = parseInt( page.data[section]["data-Ability Score Choice"].split("+")[0] );
                }
                var total = choices;
                if(choices >= 2 && page.values[section + "_ability_choice2"]) choices--;
                if(page.values[section + "_ability_choice"]) choices--;
                if(page.values[section + "_ability_choice1"]) choices--;
                if(choices > 0) missing.ability = [total, choices];
            }
            if(page.data[section]["data-Expertise Choice 1"] || page.data[section]["data-Expertise Choice 2"]) {
                var choices = 0;
                if(page.data[section]["data-Expertise Choice 1"]) choices++;
                if(page.data[section]["data-Expertise Choice 2"]) choices++;
                var total = choices;
                if(choices >= 2 && page.values[section + "_expertise_choice_2"]) choices--;
                if(page.values[section + "_expertise_choice"]) choices--;
                if(page.values[section + "_expertise_choice_1"]) choices--;
                if(choices > 0) missing.expertise = [total, choices];
            }
        }
        _.each(missing, function(number, type) {
            var singular = type == "ability" ? "an" : "a"
            if(type == "ability") {
                type = 'ability score increase'
            }
            warnings += '<p class="sheet-warning">You\'re ' + sectionName;
            if(type == "expertise") {
                warnings += " gives you expertise in ";
                warnings += number[0] > 1 ? 'up to ' + number[0] + ' skills' : " a skill";
            } else {
                warnings += " allows you to choose ";
                warnings += number[0] > 1 ? "up to " + number[0] + ' ' + type.toLowerCase() + 's' : singular + " " + type.toLowerCase();
            }
            if(number[0] - number[1] > 0) {
                warnings += ', but you\'ve only chosen ' + number[1] + '!</p>';
            } else {
                warnings += number[0] > 1 ? ', and you haven\'t chosen any!</p>' : ', and you haven\'t chosen one!</p>';
            }
        });
        return warnings;
    };

    if(mancerdata["l1-race"] && racename) {
        set["race_info"] = '<p>Your race is ' + racename + '</p>';
        if(!mancerdata["l1-race"].values.age) set["race_info"] += '<p class="sheet-warning">You haven\'t entered an age for your character.</p>';
        if(!mancerdata["l1-race"].values.alignment) set["race_info"] += '<p class="sheet-warning">You haven\'t chosen your alignment.</p>';
        set["race_info"] += handleMissing("race");
        if(mancerdata["l1-race"].values["has_subrace"] == "true") {
            if(subracename) {
                set["race_info"] += '<p>Your subrace is ' + subracename + '</p>';
                set["race_info"] += handleMissing("subrace");
            } else {
                if(mancerdata["l1-race"].values.subrace == "Rules:Races" && !mancerdata["l1-race"].values.subrace_name) {
                    set["race_info"] = '<p class="sheet-warning sheet-needed">You need to pick a name for your custom subrace!</p>';
                } else {
                    set["race_info"] += '<p class="sheet-warning sheet-needed">You have not selected a subrace!</p>';
                }
                ready = false;
            }
        }
        _.each(powerdata.errors.race, function(error) {
            switch(error) {
                case "custom_race_power_list":
                    set["race_info"] += '<p class="sheet-warning sheet-needed">You have not selected power list for your innate powercasting!</p>';
                    ready = false;
                    break;
                default:
                    console.log("Unknown race power error: " + error);
            }
        });
        if(mancerdata["l1-race"].values.race == "Rules:Races") {
            if(!mancerdata["l1-race"].values.size) set["race_info"] += '<p class="sheet-warning">You have not selected a size for your custom race!</p>';
            if(!mancerdata["l1-race"].values.speed) set["race_info"] += '<p class="sheet-warning">You have not selected a walking speed for your custom race!</p>';
        }
    } else {
        if(mancerdata["l1-race"] && mancerdata["l1-race"].values.race == "Rules:Races" && !mancerdata["l1-race"].values.race_name) {
            set["race_info"] = '<p class="sheet-warning sheet-needed">You need to pick a name for your custom race!</p>';
        } else {
            set["race_info"] = '<p class="sheet-warning sheet-needed">You have not selected a race!</p>';
        }
        ready = false;
    }

    if(mancerdata["l1-class"] && classname) {
        set["class_info"] = '<p>Your class is ' + classname + '.</p>';
        for(var x=1; x<=2; x++) {
            var featurename = mancerdata["l1-class"].values["class_feature_choice_" + x + "_name"];
            var featurechoice = mancerdata["l1-class"].values["class_feature_choice_" + x];
            if(featurename) {
                if(featurechoice) {
                    set["class_info"] += '<p>Your ' + featurename + ' is ' + featurechoice + '.</p>'
                } else {
                    set["class_info"] += '<p class="sheet-warning">Your have not chosen a ' + featurename + '.</p>';
                };
            };
        };
        set["class_info"] += handleMissing("class");
        if(mancerdata["l1-class"].values.race == "Rules:Classes" && !mancerdata["l1-class"].values.custom_hit_die) {
            set["class_info"] = '<p class="sheet-warning">You need to pick a hit die for your custom class!</p>';
        }
        if(mancerdata["l1-class"].data.class && mancerdata["l1-class"].data.class["data-Subclass Level"] == 1) {
            if(subclassname && mancerdata["l1-class"].data.class && mancerdata["l1-class"].data.class["data-Subclass Level"] == 1) {
                set["class_info"] += '<p>Your ' + mancerdata["l1-class"].data.class["Subclass Name"] + ' is ' + subclassname + '.</p>';
                for(var x=1; x<=2; x++) {
                    var featurename = mancerdata["l1-class"].values["subclass_feature_choice_" + x + "_name"];
                    var featurechoice = mancerdata["l1-class"].values["subclass_feature_choice_" + x];
                    if(featurename) {
                        if(featurechoice) {
                            set["class_info"] += '<p>Your ' + featurename + ' is ' + featurechoice + '.</p>'
                        } else {
                            set["class_info"] += '<p class="sheet-warning">Your have not chosen a ' + featurename + '.</p>';
                        };
                    };
                };
                set["class_info"] += handleMissing("subclass", mancerdata["l1-class"].data.class["Subclass Name"]);
            } else {
                if(mancerdata["l1-class"].values.subclass == "Rules:Classes" && !mancerdata["l1-class"].values.subrace_name) {
                    set["class_info"] = '<p class="sheet-warning sheet-needed">You need to pick a name for your custom ' + mancerdata["l1-class"].data.class["Subclass Name"] + '!</p>';
                } else {
                    set["class_info"] += '<p class="sheet-warning sheet-needed">You have not selected a ' + mancerdata["l1-class"].data.class["Subclass Name"] + '!</p>';
                }
                ready = false;
            }
        }
        _.each(powerdata.errors.class, function(error) {
            switch(error) {
                case "custom_class_power_list":
                    set["race_info"] += '<p class="sheet-warning sheet-needed">You have selected a powercasting ability for your custom class, but you have not selected a power list.</p>';
                    ready = false;
                    break;
                case "custom_class_power_number":
                    set["race_info"] += '<p class="sheet-warning sheet-needed">You have selected a powercasting ability for your custom class, but you have not selected a number of powers.</p>';
                    ready = false;
                    break;
                default:
                    console.log("Unknown class power error: " + error);
            }
        });
    } else {
        if(mancerdata["l1-class"] && mancerdata["l1-class"].values.race == "Rules:Classes" && !mancerdata["l1-class"].values.race_name) {
            set["class_info"] = '<p class="sheet-warning sheet-needed">You need to pick a name for your custom class!</p>';
        } else {
            set["class_info"] = '<p class="sheet-warning sheet-needed">You have not selected a class!</p>';
        }
        ready = false;
    }

    if(mancerdata["l1-abilities"] && mancerdata["l1-abilities"].values.abilities) {
        switch(mancerdata["l1-abilities"].values.abilities) {
            case "Standard Array":
                set["ability_info"] = '<p>You generated your stats from the standard array.</p>';
                break;
            case "Roll for Stats":
                set["ability_info"] = '<p>You generated your stats by rolling.</p>';
                break;
            case "Point Buy":
                set["ability_info"] = '<p>You generated your stats with the point buy method.</p>';
                break;
            case "custom":
                set["ability_info"] = '<p>You entered custom values for your stats.</p>';
                break;
        }
        var x = 0;
        _.each(abilityList, function(ability) {
            if(!mancerdata["l1-abilities"].values[ability.toLowerCase()]) {
                x++;
                set["ability_info"] += '<p class="sheet-warning sheet-needed">You have not selected a score for your ' + ability.toLowerCase() + '!</p>';
                ready = false;
            }
        });
        if(x == 6) set["ability_info"] = '<p class="sheet-warning">You have not selected your ability scores!</p>';
    } else {
        set["ability_info"] = '<p class="sheet-warning sheet-needed">You have not generated your ability scores!</p>';
        ready = false;
    }

    if(mancerdata["l1-background"] && bgname) {
        set["background_info"] = '<p>You come from a ' + bgname + ' background.</p>';
        if(mancerdata["l1-background"].data.background && mancerdata["l1-background"].data.background["data-Background Choice Name"]) {
            if(!mancerdata["l1-background"].values["background_detail_choice"]) {
                set["background_info"] += '<p class="sheet-warning">You haven\'t chosen your ';
                set["background_info"] += mancerdata["l1-background"].data.background["data-Background Choice Name"] +'.</p>';
            }
        }
        if(!mancerdata["l1-background"].values["background_personality_choice1"] && !mancerdata["l1-background"].values["background_personality_choice2"]) {
            set["background_info"] += '<p class="sheet-warning">You haven\'t picked your personality traits.</p>';
        } else if(!mancerdata["l1-background"].values["background_personality_choice1"] || !mancerdata["l1-background"].values["background_personality_choice2"]) {
            set["background_info"] += '<p class="sheet-warning">You haven\'t picked one of your personality traits.</p>';
        }
        if(!mancerdata["l1-background"].values["background_ideal_choice"]) {
            set["background_info"] += '<p class="sheet-warning">You haven\'t chosen your ideal.</p>';
        }
        if(!mancerdata["l1-background"].values["background_bond_choice"]) {
            set["background_info"] += '<p class="sheet-warning">You haven\'t chosen your bond.</p>';
        }
        if(!mancerdata["l1-background"].values["background_flaw_choice"]) {
            set["background_info"] += '<p class="sheet-warning">You haven\'t chosen your flaw.</p>';
        }
        set["background_info"] += handleMissing("background");
    } else {
        set["background_info"] = '<p class="sheet-warning sheet-needed">You have not selected a background!</p>';
        ready = false;
    }

    if(mancerdata["l1-equipment"] && mancerdata["l1-equipment"].values["equipment_type"]) {
        switch(mancerdata["l1-equipment"].values["equipment_type"]) {
            case "class":
                set["equipment_info"] = '<p>You got starting equipment based on your class and background.</p>';
                break;
            case "gold":
                set["equipment_info"] = '<p>You opted for gold instead of starting equipment.</p>';
                break;
        }
        if(mancerdata["l1-equipment"].values["equipment_type"] == "class") {
            var choices = {"class": [0,0], "background": [0,0]};
            _.each(choices, function(numbers, section) {
                var equipment = mancerdata["l1-" + section].data[section] && mancerdata["l1-" + section].data[section]["data-Equipment"] ? mancerdata["l1-" + section].data[section]["data-Equipment"] : {};
                _.each(equipment, function(choice, choicekey) {
                    if(choicekey != "default") numbers[0]++;
                });
                _.each(mancerdata["l1-equipment"].values, function(val, key) {
                    if(key.includes(section + "_equipment_choice")) numbers[1]++;
                });
            });
            _.each(choices, function(number, type) {
                if(number[0] - number[1] > 0) {
                    set["equipment_info"] += '<p class="sheet-warning">Your ' + type + ' gives you ';
                    set["equipment_info"] += number[0] > 1 ? number[0] + " equipment choices" : "an equipment choice";
                    if(number[1] > 0) {
                        set["equipment_info"] += ', but you\'ve only chosen ' + number[1] + '!</p>';
                    } else {
                        set["equipment_info"] += number[0] > 1 ? ', and you haven\'t chosen any!</p>' : ', and you haven\'t chosen it!</p>';
                    }
                }
            });
        }
        if(mancerdata["l1-equipment"].values["equipment_type"] == "gold" && mancerdata["l1-equipment"].values["starting_gold"] == "0") {
            set["equipment_info"] = '<p class="sheet-warning">You selected starting wealth for your equipment, but you don\'t have any gold yet!</p>';
        }
        if(mancerdata["l1-equipment"].values["equipment_class"] != getName("class", mancerdata, true) || (mancerdata["l1-equipment"].values["equipment_background"] != getName("background", mancerdata, true) && mancerdata["l1-equipment"].values["equipment_type"] != "gold")) {
            set["equipment_info"] = '<p class="sheet-warning sheet-needed">Your equipment options have changed, you\'ll need to choose again.</p>';
            ready = false;
        }
    } else {
        set["equipment_info"] = '<p class="sheet-warning sheet-needed">You have not selected any equipment!</p>';
        ready = false;
    }

    var powersready = true;
    var toDelete = [];
    if(mancerdata["l1-powers"]) {
        prevRace = mancerdata["l1-powers"].values.race_powers || "";
        prevClass = mancerdata["l1-powers"].values.class_powers || "";
        currentRace = getName("race", mancerdata, true) + getName("subrace", mancerdata, true);
        currentClass = getName("class", mancerdata, true) + getName("subclass", mancerdata, true);
        set["power_info"] = "";
        if((racePowers + classPowers) == 0) {
            set["power_info"] += '<p>The tech is a mystery to you.</p>';
            deleteCharmancerData(["l1-powers"]);
            powersready = false;
        } else if(prevRace != currentRace || prevClass != currentClass || mancerdata["l1-powers"].values.race_number != racePowers || mancerdata["l1-powers"].values.class_number != classPowers) {
            if(prevRace != currentRace || mancerdata["l1-powers"].values.race_number > racePowers) {
                for(var x = 1; x<=9; x++) {
                    toDelete.push("race_level0_choice" + x);
                    toDelete.push("race_level1_choice" + x);
                }
                if(racePowers > 0 && mancerdata["l1-powers"].values.race_number > 0) {
                    set["power_info"] += '<p class="sheet-warning">Your racial powers were reset because your options have changed.</p>';
                }
            }
            if(prevClass != currentClass || mancerdata["l1-powers"].values.class_number > classPowers) {
                for(var x = 1; x<=9; x++) {
                    toDelete.push("class_level0_choice" + x);
                    toDelete.push("class_level1_choice" + x);
                }
                if(classPowers > 0 && mancerdata["l1-powers"].values.class_number > 0) {
                    set["power_info"] += '<p class="sheet-warning">Your class powers were reset because your options have changed.</p>';
                }
            }
        }
    } else if((racePowers + classPowers) > 0) {
        set["power_info"] = '<p class="sheet-warning">You haven\'t selected your powers!</p>';
        powersready = false
    } else {
        set["power_info"] = '<p>The tech is a mystery to you.</p>';
        powersready = false
    }

    if(mancerdata["l1-race"] && mancerdata["l1-race"].data.subrace && mancerdata["l1-race"].data.subrace["data-Feats"]) {
        if(mancerdata["l1-feat"] && mancerdata["l1-feat"].values.feat) {
            set["feat_info"] = '<p>You\'ve selected the ' + mancerdata["l1-feat"].values.feat.split(":")[1] + ' feat.</p>';
            set["feat_info"] += handleMissing("feat");
        } else {
            set["feat_info"] = '<p class="sheet-warning">You have access to a feat, but you have not yet selected one!</p>';
        }
    } else {
        set["feat_info"] = '<p>As you exchange your novice notions of the world for experience, a feat may become within reach. Not today, however.</p>';
        deleteCharmancerData(["l1-feat"]);
    }

    if(ready) {
        set.ready_message = "If you're ready to build your " + racename;
        set.ready_message += subracename == "" ? " " : " (" + subracename + ") ";
        set.ready_message += subclassname == "" ? classname : classname + " (" + subclassname + ")";
        set.ready_message += " from a " + bgname + " background, click \"Apply Changes.\"";
        showChoices(["apply_changes", "ready_text"]);
    } else {
        set.ready_message = "Hold on there! You've missed some required fields, which have been marked with a <span class='sheet-needed'></span>.";
    }
    //If you're ready to build your race class from a background background, click "Apply Changes."
    deleteCharmancerData([{"l1-powers":toDelete}], function() {
        powerdata = knownPowers();
        if(powersready) {
            if (powerdata.known && powerdata.known.length) {
                set["power_info"] += '<p>You know these powers: ' + powerdata.known.join(", ") + '.</p>';
            }
            var choices = {"cantrip": [0,0], "power": [0,0]};
            _.each(powerdata, function(section) {
                _.each(section.choices, function(power) {
                    if(power.Level == 0) choices.cantrip[0]++;
                    if(power.Level == 1) choices.power[0]++;
                });
            });
            choices.cantrip[1] = choices.cantrip[0];
            choices.power[1] = choices.power[0];
            _.each(mancerdata["l1-powers"].values, function(val, name) {
                if(name.split("_")[1] == "level0" && _.last(name.split("_")) != "casting") choices.cantrip[1]--;
                if(name.split("_")[1] == "level1" && _.last(name.split("_")) != "casting") choices.power[1]--;
            });
            _.each(choices, function(number, type) {
                if(number[1] > 0) {
                    set["power_info"] += '<p class="sheet-warning">You can choose ';
                    set["power_info"] += number[0] > 1 ? "up to " + number[0] + ' ' + type + 's' : "a " + type;
                    if(number[1] < number[0]) {
                        set["power_info"] += ', but you\'ve only chosen ' + (number[0] - number[1]) + '!</p>';
                    } else {
                        set["power_info"] += number[0] > 1 ? ', and you haven\'t chosen any!</p>' : ', and you haven\'t chosen one!</p>';
                    }
                }
            });
        }
        setCharmancerText(set);
    });
});

on("mancer:cancel", function(eventinfo) {
    if(!eventinfo["value"]) {return;};
    var update = {};

    if(eventinfo["value"] === "l1-welcome" || eventinfo["value"] === "l1-cancel") {
        update["l1mancer_status"] = "completed";
        update["charactermancer_step"] = "l1-welcome";
        deleteCharmancerData(["l1-welcome","l1-race","l1-class","l1-abilities","l1-background","l1-equipment","l1-powers","l1-summary"]);
    }
    else if(eventinfo["value"].substring(0,3) === "l1-") {
        update["l1mancer_status"] = eventinfo["value"];
    };

    setAttrs(update);
});

on("mancerfinish:l1-mancer", function(eventinfo) {
    var noEquipmentDrop = false;
    if(eventinfo.data["l1-equipment"]) {
        noEquipmentDrop = eventinfo.data["l1-equipment"].values["equipment_type"] == "gold";
    }
    var getMancerPowers = function(mancerdata) {
        var powersKnown = [];
        if(mancerdata["l1-race"].data.subrace) {
            _.each(mancerdata["l1-race"].data.subrace["data-Powers"], function(power) {
                if(power.Name) {
                    powersKnown.push( {name: power.Name, ability: power.Ability} );
                }
            });
        }
        if(mancerdata["l1-race"].data.race) {
            _.each(mancerdata["l1-race"].data.race["data-Powers"], function(power) {
                if(power.Name) {
                    powersKnown.push( {name: power.Name, ability: power.Ability} );
                }
            });
        }
        if(mancerdata["l1-class"].data.subclass) {
            _.each(mancerdata["l1-class"].data.subclass["data-Class Powers"], function(power, level) {
                _.each(power.Known, function(known) {
                    powersKnown.push( {name: known, ability: mancerdata["l1-class"].data.class["Powercasting Ability"]} );
                });
            });
            _.each(mancerdata["l1-class"].data.subclass["data-Powers"], function(power) {
                if(power.Name) {
                    powersKnown.push( {name: power.Name, ability: power.Ability} );
                }
            });
        }
        if(mancerdata["l1-class"].data.class) {
            _.each(mancerdata["l1-class"].data.class["data-Class Powers"], function(power, level) {
                _.each(power.Known, function(known) {
                    powersKnown.push( {name: known, ability: mancerdata["l1-class"].data.class["Powercasting Ability"]} );
                });
            });
            _.each(mancerdata["l1-class"].data.class["data-Powers"], function(power) {
                if(power.Name) {
                    powersKnown.push( {name: power.Name, ability: power.Ability} );
                }
            });
        }
        if(mancerdata["l1-powers"] && mancerdata["l1-powers"].values) {
            _.each(mancerdata["l1-powers"].values, function(value, name) {
                if(value.substr(0,7) == "Powers:") {
                    powersKnown.push( {name: value.substring(7), ability: mancerdata["l1-powers"].values[name + "_casting"]} );
                }
            });
        }
        return powersKnown;
    };
    var getMancerStats = function(mancerdata) {
        //Recalculate Ability Scores
        //var hp = 0;
        var allAbilities = {race: {}, subrace: {}};
        var disableAbilities = {};
        var allProficiencies = {};
        var toSet = {};
        var proficiencyList = ["Weapon", "Armor", "Skill", "Tool", "Language"];
        var abilityList = ["Strength", "Dexterity", "Constitution", "Intelligence", "Wisdom", "Charisma"];
        var proficiencyNum = 4;
        var hitpoints = mancerdata["l1-class"].data.class ? mancerdata["l1-class"].data.class["Hit Die"] : mancerdata["l1-class"].values["custom_hit_die"];
        hitpoints = parseInt(hitpoints.replace("d", ""));

        _.each(mancerdata, function(page){
            _.each(page.values, function(value, name) {
                if(name.search("ability") !== -1) {
                    //var choiceSection = name.split("_")[0].replace("sub", "");
                    var choiceSection = name.split("_")[0];
                    if(page.data[choiceSection] && page.data[choiceSection]["data-Ability Score Choice"]) {
                        var increase = 1;
                        if(typeof page.data[choiceSection]["data-Ability Score Choice"] == "string") {
                            parseInt( _.last( page.data[choiceSection]["data-Ability Score Choice"].split("+") ) );
                        }
                        allAbilities[choiceSection] = allAbilities[choiceSection] || {};
                        allAbilities[choiceSection][value.toLowerCase()] = increase;
                        disableAbilities[choiceSection] = disableAbilities[choiceSection] || [];
                        disableAbilities[choiceSection].push(value);
                    }
                }
            });
            _.each(page.data, function(pagedata, increaseSection) {
                if(pagedata["data-Ability Score Increase"]) {
                    _.each(pagedata["data-Ability Score Increase"], function(amount, ability) {
                        allAbilities[increaseSection] = allAbilities[increaseSection] || {};
                        allAbilities[increaseSection][ability.toLowerCase()] = amount;
                        disableAbilities[increaseSection] = disableAbilities[increaseSection] || [];
                        disableAbilities[increaseSection].push(ability.toLowerCase());
                    });
                }
                if(pagedata["data-HP per level"]) {
                    hitpoints += pagedata["data-HP per level"];
                }
            });
        });
        if(mancerdata["l1-race"] && mancerdata["l1-race"].values.race == "Rules:Races") {
            _.each(abilityList, function(ability){
                var custom = mancerdata["l1-race"].values["race_custom_" + ability.toLowerCase()] || false;
                if(custom) {
                    allAbilities.race[ability.toLowerCase()] = parseInt(custom);
                }
            });
        }
        if(mancerdata["l1-race"] && mancerdata["l1-race"].values.subrace == "Rules:Races") {
            _.each(abilityList, function(ability){
                var custom = mancerdata["l1-race"].values["subrace_custom_" + ability.toLowerCase()] || false;
                if(custom) {
                    allAbilities.subrace[ability.toLowerCase()] = parseInt(custom);
                }
            });
        }
        var abilityTotals = {}
        _.each(allAbilities, function(abilities) {
            _.each(abilities, function(amount, ability) {
                abilityTotals[ability] = abilityTotals[ability] || {bonus: 0};
                abilityTotals[ability].bonus += amount;
            });
        });
        _.each(abilityList, function(upperAbility) {
            var ability = upperAbility.toLowerCase();
            abilityTotals[ability] = abilityTotals[ability] || {bonus: 0, mod: 0};
            if(mancerdata["l1-abilities"].values[ability]) {
                abilityTotals[ability].base = parseInt( mancerdata["l1-abilities"].values[ability].split("~")[0] );
            } else {
                abilityTotals[ability].base = 0;
            }
            abilityTotals[ability].total = abilityTotals[ability].bonus + abilityTotals[ability].base;
            abilityTotals[ability].mod = Math.floor((abilityTotals[ability].total - 10)/2);
        });
        allAbilities.totals = abilityTotals;

        hitpoints += abilityTotals.constitution.mod;

        //Recalculate Proficiencies
        _.each(proficiencyList, function(prof){
            //First get a list of all proficiencies
            var finalProfs = [];
            _.each(mancerdata, function(page){
                _.each(page.values, function(value, name) {
                    if(name.search(prof.toLowerCase()) !== -1 || prof.toLowerCase() == "language" && name.search("class_feature_choice") !== -1) {
                        if (value.split(":")[0] == "Proficiencies") {
                            finalProfs.push( _.last(value.split(":")) );
                        }
                    }
                });
                _.each(page.data, function(pagedata) {
                    if(pagedata["data-" + prof + " Proficiency"] && pagedata["data-" + prof + " Proficiency"].Proficiencies) {
                        finalProfs = finalProfs.concat(pagedata["data-" + prof + " Proficiency"].Proficiencies);
                    }
                });
            });
            allProficiencies[prof.toLowerCase()] = _.without(_.uniq(finalProfs), "custom");
        });

        var expertiseSelects = {};
        var currentExpertise = [];
        //Get a list of active expertise selects
        _.each(mancerdata, function(page, pagename) {
            _.each(page.data, function(data, section) {
                for(var num=1; num<=proficiencyNum; num++) {
                    if( _.keys(data).indexOf("data-Expertise Choice " + num) != -1 ) {
                        expertiseSelects[section + "_expertise_choice_" + num] = data["data-Expertise Choice " + num];
                    }
                }
            });
        });
        _.each(expertiseSelects, function(fillArray, selectName) {
            var expertChoices = [];
            var options = {category: "Proficiencies", silent: true}
            var currentValue = "";
            //Create the list of values for this select
            _.each(fillArray, function(expert) {
                if(expert == "KNOWN") {
                    expertChoices = expertChoices.concat(allProficiencies.skill);
                } else {
                    expertChoices.push(expert);
                }
            });
            //Get the current value of the select
            _.each(mancerdata, function(page){
                _.each(page.values, function(value, name) {
                    if(name == selectName) {
                        currentValue = _.last(value.split(":"));
                    }
                });
            });

            if(currentValue != "") {
                //If the current value is not available, set it to blank. otherwise, add it to the list of expertise skills
                if(expertChoices.indexOf(currentValue) == -1) {
                    options.selected = "";
                    toSet[selectName] = "";
                } else {
                    currentExpertise.push(currentValue);
                }
            }
        });

        return {abilities: allAbilities, proficiencies: allProficiencies, expertise: _.uniq(currentExpertise), hp: hitpoints}
    };
    var doAllDrops = function(dropArray, callback) {
        var thisPage = dropArray.shift();
        var pageName = thisPage;
        var additionalData = {};
        if(typeof thisPage == "object") {
            pageName = thisPage.name;
            additionalData = thisPage.data || {};
        }

        getCompendiumPage(pageName, function(pageData) {
            pageName = pageName.indexOf("@@!!@@") > -1 ? pageName.replace(/@@!!@@/g,"") : pageName; // Hacky bugfix to prevent custom names from matching unavailable content
            currentDrop++;
            if(typeof pageData == "string") {
                console.log("Creating custom drop for " + pageName);
                pageData = {name: pageName.split(":")[1], content: "", data: {Category: pageName.split(":")[0], Source: "Charactermancer"}};
            };
            setCharmancerText({"mancer_category": pageData.data.Category, "mancer_progress":"Applying change " + currentDrop + " out of " + totalDrops});
            pageData.data = _.extend(pageData.data, additionalData);
            if(pageData.data["data-Equipment"]) {
                var json = JSON.parse(pageData.data["data-Equipment"]);
                var newItems = makeItemData(json.default);
                console.log("ADDING ADDITIONAL ITEMS:");
                totalDrops += newItems.length;
                dropArray = dropArray.concat(newItems);
            }
            if(pageData.data["data-Starting Gold"] && !noEquipmentDrop) {
                set["gp"] += parseInt(pageData.data["data-Starting Gold"]);
            }
            if(pageData.data["data-Bundle"]) {
                var json = JSON.parse(pageData.data["data-Bundle"]);
                var newItems = makeItemData(json);
                console.log("ADDING ADDITIONAL ITEMS (FROM BUNDLE):");
                totalDrops += newItems.length
                dropArray = dropArray.concat(newItems);
                doAllDrops(dropArray, callback);
            } else {
                dropCompendiumData("licensecontainer", pageData, function(data) {
                    console.log("Dropped " + pageName);
                    if(dropArray.length > 0) {
                        doAllDrops(dropArray, callback);
                    } else {
                        callback();
                    }
                });
            }
        });
    };
    var makeItemData = function(items) {
        if (noEquipmentDrop) {
            return [];
        } else {
            var itemArray = [];
            var splitItems = [];
            _.each(items, function(item) {
                item = item.split(",");
                _.each(item, function(splitItem) {
                    splitItems.push(splitItem.trim());
                });
            })
            _.each(splitItems, function(item) {
                var itemname = item.split("(")[0].trim().replace("Items:", "");
                itemname = itemname.substring(0,4) == "and " ? itemname.substr(4) : itemname;
                var itemdata = {name:"Items:" + itemname, data:{}}
                if(item.includes("(")) {
                    var par = item.split("(")[1].split(")")[0];
                    if( !isNaN(parseInt(par)) ) {
                        itemdata.data["itemcount"] = parseInt(par);
                    }
                }
                if(itemname != "") {
                    itemArray.push(itemdata);
                }
            });
            return itemArray;
        }
    };
    var eraseRepeating = function(sectionArray, callback) {
        var thisSection = sectionArray.shift();
        getSectionIDs(thisSection, function(itemids) {
            _.each(itemids, function(item) {
                removeRepeatingRow("repeating_" + thisSection + "_" + item);
            });
            if(sectionArray.length > 0) {
                eraseRepeating(sectionArray, callback);
            } else {
                callback();
            }

        });
    }
    var data = eventinfo.data;
    var stats = getMancerStats(data);
    var powers = getMancerPowers(data);
    var equipment = [];
    var silentset = {};
    var clearset = {};
    var set = {gp: 0};
    var allDrops = [];
    var currentDrop = 0;
    var totalDrops = 1;
    var allSkills = ["athletics", "acrobatics", "sleight_of_hand", "stealth", "technology", "lore", "investigation", "nature", "piloting", "animal_handling", "insight", "medicine", "perception", "survival","deception", "intimidation", "performance", "persuasion"];
    var allAbilities = ["strength", "dexterity", "constitution", "intelligence", "wisdom", "charisma"];
    var eraseSections = ["attack", "inventory", "traits", "resource", "proficiencies", "tool", "damagemod", "power-cantrip"];
    for(var x=1; x<=9; x++) {
        eraseSections.push("power-" + x);
    }
    //first set is silent to make sure certain things don't trigger workers
    silentset["class_resource_name"] = "";
    silentset["class_resource"] = "";
    silentset["class_resource_max"] = "";
    silentset["other_resource_name"] = "";
    silentset["other_resource"] = "";
    silentset["other_resource_max"] = "";
    silentset["other_resource_itemid"] = "";
    silentset["class"] = "";
    silentset["class_display"] = "";
    silentset["subclass"] = "";
    silentset["hitdietype"] = "";
    silentset["hitdie_final"] = "";
    silentset["race"] = "";
    silentset["subrace"] = "";
    silentset["race_display"] = "";
    silentset["custom_class"] = "";
    silentset["cust_classname"] = "";
    //Set up setAttrs to erase some fields
    clearset["precognition_flag"] = "0";
    clearset["age"] = "";
    clearset["hp"] = "";
    clearset["hp_max"] = "";
    clearset["size"] = "";
    clearset["speed"] = "";
    clearset["gp"] = "";
    clearset["alignment"] = "";
    clearset["global_damage_mod_flag"] = "";
    clearset["powercasting_ability"] = "";
    clearset["cust_hitdietype"] = "";
    clearset["cust_powerslots"] = "";
    clearset["cust_powercasting_ability"] = "";
    clearset["tab"] = "core";
    clearset["ac"] = "";
    clearset["jack_bonsu"] = "";
    clearset["jack_attr"] = "";
    clearset["death_save_bonus"] = "";
    clearset["weighttotal"] = "";
    clearset["hiddenweighttotal"] = "";
    clearset["initiative_bonus"] = "";
    clearset["hit_dice"] = "";
    clearset["hit_dice_max"] = "";
    clearset["base_level"] = "1";
    clearset["level"] = "1";
    clearset["pb"] = "";
    clearset["jack"] = "";
    clearset["caster_level"] = "";
    clearset["power_attack_mod"] = "";
    clearset["power_attack_bonus"] = "";
    clearset["power_save_dc"] = "";
    clearset["armorwarningflag"] = "hide";
    clearset["armorwarning"] = "0";
    clearset["passive_wisdom"] = "";
    _.each(allSkills, function(skill) {
        clearset[skill + "_prof"] = "";//0
        clearset[skill + "_type"] = "";//1
        clearset[skill + "_bonus"] = "";
    });
    _.each(allAbilities, function(ability) {
        clearset[ability + "_save_prof"] = "";
        clearset[ability + "_save_bonus"] = "";
        clearset[ability + "_bonus"] = "0";
        clearset["cust_" + ability + "_save_prof"] = "";
    });
    clearset["personality_traits"] = "";
    _.each(["ideal", "bond", "flaw"], function(type) {
        clearset[type + "s"] = "";
    });
    clearset["background"] = "";
    //Set up second setAttrs with ability scores
    _.each(stats.abilities.totals, function(scores, name) {
        clearset[name + "_base"] = scores.total;
    });
    //Add class features to first setAttrs [name, desc, source"Class", source_type:"Fighter", options-flag: 0]
    for(var x=1; x<=4; x++) {
        if(data["l1-class"].values["class_feature_choice_" + x] && data["l1-class"].values["class_feature_choice_" + x].search("Proficiencies:") == -1) {
            if (data["l1-class"].values["class_feature_choice_" + x + "_manual"]) {
                var newrowid1 = generateRowID();
                var name = data["l1-class"].values["class_feature_choice_" + x + "_name"] || "";
                name += ": " + data["l1-class"].values["class_feature_choice_" + x + "_manual"];
                clearset["repeating_traits_" + newrowid1 + "_name"] = name;
                clearset["repeating_traits_" + newrowid1 + "_source"] = "Class";
                clearset["repeating_traits_" + newrowid1 + "_source_type"] = _.last(data["l1-class"].values.class.split(":"));
                clearset["repeating_traits_" + newrowid1 + "_description"] = data["l1-class"].values["class_feature_choice_" + x + "_desc"] || "";
                clearset["repeating_traits_" + newrowid1 + "_options-flag"] = 0;
                clearset["repeating_traits_" + newrowid1 + "_display_flag"] = "on";
                if (data["l1-class"].values["class_feature_choice_" + x + "_manual2"]) {
                    var newrowid2 = generateRowID();
                    var name = data["l1-class"].values["class_feature_choice_" + x + "_name"] || "";
                    name += ": " + data["l1-class"].values["class_feature_choice_" + x + "_manual2"];
                    clearset["repeating_traits_" + newrowid2 + "_name"] = name;
                    clearset["repeating_traits_" + newrowid2 + "_source"] = "Class";
                    clearset["repeating_traits_" + newrowid2 + "_source_type"] = _.last(data["l1-class"].values.class.split(":"));
                    clearset["repeating_traits_" + newrowid2 + "_description"] = data["l1-class"].values["class_feature_choice_" + x + "_desc"] || "";
                    clearset["repeating_traits_" + newrowid2 + "_options-flag"] = 0;
                    clearset["repeating_traits_" + newrowid2 + "_display_flag"] = "on";
                }
            } else {
                var newrowid = generateRowID();
                var name = data["l1-class"].values["class_feature_choice_" + x + "_name"] || "";
                name += ": " + data["l1-class"].values["class_feature_choice_" + x];
                clearset["repeating_traits_" + newrowid + "_name"] = name;
                clearset["repeating_traits_" + newrowid + "_source"] = "Class";
                clearset["repeating_traits_" + newrowid + "_source_type"] = _.last(data["l1-class"].values.class.split(":"));
                clearset["repeating_traits_" + newrowid + "_description"] = data["l1-class"].values["class_feature_choice_" + x + "_desc"] || "";
                clearset["repeating_traits_" + newrowid + "_options-flag"] = 0;
                clearset["repeating_traits_" + newrowid + "_display_flag"] = "on";
            }
        };
    }
    if(data["l1-class"].values.subclass) {
        for(var x=1; x<=4; x++) {
            if(data["l1-class"].values["subclass_feature_choice_" + x]) {
                var newrowid = generateRowID();
                var name = data["l1-class"].values["subclass_feature_choice_" + x + "_name"] || "";
                name += ": " + data["l1-class"].values["subclass_feature_choice_" + x];
                clearset["repeating_traits_" + newrowid + "_name"] = name;
                clearset["repeating_traits_" + newrowid + "_source"] = "Class";
                clearset["repeating_traits_" + newrowid + "_source_type"] = _.last(data["l1-class"].values.class.split(":")) + " - " + _.last(data["l1-class"].values.subclass.split(":"));
                clearset["repeating_traits_" + newrowid + "_description"] = data["l1-class"].values["subclass_feature_choice_" + x + "_desc"] || "";
                clearset["repeating_traits_" + newrowid + "_options-flag"] = 0;
                clearset["repeating_traits_" + newrowid + "_display_flag"] = "on";
            };
        }
    }

    //Set up drops. start with class, subclass, race, subrace, background
    if(data["l1-class"].values["class_name"] && !data["l1-class"].data.class) {
        var customClass = {data: {}};
        customClass.name = "Classes@@!!@@:" + data["l1-class"].values["class_name"];
        set["custom_class"] = "1";
        set["cust_classname"] = data["l1-class"].values["class_name"];
        set["cust_hitdietype"] = data["l1-class"].values["custom_hit_die"];
        if(data["l1-class"].values["custom_class_power_ability"]) {
            set["cust_powerslots"] = "full";
            set["cust_powercasting_ability"] = "@{" + data["l1-class"].values["custom_class_power_ability"].toLowerCase() + "_mod}+";
        }
        traits = [];
        for(var x = 1; x <= 4; x++) {
            var trait = {};
            if(data["l1-class"].values["custom_class_trait_name_" + x]) {
                trait.Name = data["l1-class"].values["custom_class_trait_name_" + x];
                trait.Desc = data["l1-class"].values["custom_class_trait_desc_" + x] || "";
                traits.push(trait);
            }
        }
        if(traits.length > 0) {
            customClass.data["data-Traits"] = JSON.stringify(traits);
        }
        _.each(allAbilities, function(ability) {
            if(data["l1-class"].values[ability.toLowerCase() + "_save"]) {
                set["cust_" + ability + "_save_prof"] = "(@{pb})";
            }
        });
        allDrops.push(customClass);
    } else {
        allDrops.push(data["l1-class"].values.class);
    };
    //set up subclass drop
    if(data["l1-class"].values.subclass && data["l1-class"].values["subclass_name"]) {
        var customSubclass  = {data:{}};
        customSubclass.name = "Subclasses@@!!@@:" + data["l1-class"].values["subclass_name"];
        traits = [];
        for(var x = 1; x <= 4; x++) {
            var trait = {};
            if(data["l1-class"].values["custom_class_trait_name_" + x]) {
                trait.Name = data["l1-class"].values["custom_class_trait_name_" + x];
                trait.Desc = data["l1-class"].values["custom_class_trait_desc_" + x] || "";
                traits.push(trait);
            }
        }
        if(traits.length > 0) {
            customSubclass.data["data-Traits"] = JSON.stringify(traits);
        }
        allDrops.push(customSubclass);
    } else if(data["l1-class"].values.subclass) {
        allDrops.push(data["l1-class"].values.subclass);
    };
    //set up race drop
    if(data["l1-race"].values["race_name"] && !data["l1-race"].data.race) {
        var customRace = {data: {}};
        customRace.name = "Races@@!!@@:" + data["l1-race"].values["race_name"];
        if(data["l1-race"].values.size) {
            customRace.data.Size = data["l1-race"].values.size;
        }
        if(data["l1-race"].values.speed) {
            customRace.data.Speed = data["l1-race"].values.speed;
        }
        traits = [];
        for(var x = 1; x <= 4; x++) {
            var trait = {};
            if(data["l1-race"].values["custom_race_trait_name_" + x]) {
                trait.Name = data["l1-race"].values["custom_race_trait_name_" + x];
                trait.Desc = data["l1-race"].values["custom_race_trait_desc_" + x] || "";
                traits.push(trait);
            }
        }
        if(traits.length > 0) {
            customRace.data["data-Traits"] = JSON.stringify(traits);
        }
        allDrops.push(customRace);
    } else {
        allDrops.push(data["l1-race"].values.race);
    }
    //set up subrace drop
    if(data["l1-race"].values.subrace && data["l1-race"].values["subrace_name"]) {
        var customSubrace = {data: {}};
        customSubrace.name = "Subraces@@!!@@:" + data["l1-race"].values["subrace_name"];
        customSubrace.data["data-Parent"] = data["l1-race"].values.race.split(":")[1];
        if(data["l1-race"].values.speed) {
            customSubrace.data.Speed = data["l1-race"].values.speed;
        }
        traits = [];
        for(var x = 1; x <= 4; x++) {
            var trait = {};
            if(data["l1-race"].values["custom_race_trait_name_" + x]) {
                trait.Name = data["l1-race"].values["custom_race_trait_name_" + x];
                trait.Desc = data["l1-race"].values["custom_race_trait_desc_" + x] || "";
                traits.push(trait);
            }
        }
        if(traits.length > 0) {
            customSubrace.data["data-Traits"] = JSON.stringify(traits);
        }
        allDrops.push(customSubrace);
    } else if(data["l1-race"].values.subrace) {
        allDrops.push(data["l1-race"].values.subrace);
    };
    //set up feat drop
    if(data["l1-feat"] && data["l1-feat"].values.feat) {
        var feat = {name: data["l1-feat"].values.feat, data: {Properties: "1st Level"}};
        allDrops.push(feat);
    }
    //set up background drop
    if(data["l1-background"].values.background) {
        if(data["l1-background"].values.background == "Rules:Backgrounds") {
            var customBg  = {data:{}};
            customBg.name = "Backgrounds@@!!@@:" + data["l1-background"].values["background_name"];
            if(data["l1-background"].values["custom_background_trait_name"]) {
                var trait = {};
                trait.Name = data["l1-background"].values["custom_background_trait_name"];
                trait.Desc = data["l1-background"].values["custom_background_trait_desc"] || "";
                customBg.data["data-Traits"] = JSON.stringify([trait]);
            }
            //console.log(customBg);
            allDrops.push(customBg);
        } else {
            allDrops.push(data["l1-background"].values.background);
        }
    }

    //Now add proficiency drops
    _.each(["Armor", "Language", "Tool", "Weapon"], function(proftype) {
        _.each(stats.proficiencies[proftype.toLowerCase()], function(prof) {
            var profdata = {name: "Proficiencies:" + prof, data: {Type: proftype}}
            if(stats.expertise.indexOf(prof) != -1) {
                profdata.data["toolbonus_base"] = "(@{pb}*2)";
            }
            allDrops.push(profdata);
        });
    });
    //add custom proficiencies
    _.each(["race", "class"], function(section) {
        if(data["l1-" + section].values["custom_" + section + "_prof_name_choice1"]) {
            for(var x=1; x<=4; x++) {
                if(data["l1-" + section].values["custom_" + section + "_prof_name_choice" + x]
                    && data["l1-" + section].values["custom_" + section + "_prof_type_choice" + x]) {
                    var profdata = {data: {}}
                    profdata["name"] = "Proficiencies:" + data["l1-" + section].values["custom_" + section + "_prof_name_choice" + x];
                    profdata.data.Type = data["l1-" + section].values["custom_" + section + "_prof_type_choice" + x].toLowerCase().replace("skill", "skillcustom");
                    allDrops.push(profdata);
                }
            }
        }
    })

    //Next, add power drops
    _.each(powers, function(power) {
        var powerdata = {name: "Powers:" + power.name};
        powerdata.data = {"powercasting_ability": "@{" +power.ability.toLowerCase() + "_mod}+"};
        allDrops.push(powerdata);
    });

    //Add equipment choice drops unless starting gold was chosen
    if (data["l1-equipment"].values["equipment_type"] != "gold") {
        _.each(data["l1-equipment"].values, function(val, name) {
            if(name.includes("background_equipment_choice")) {
                equipment = equipment.concat(val.split(" and "));
            }
        });
    }

    //Set up the final setAttrs()
    set["alignment"] = data["l1-race"].values.alignment || "";
    set["age"] = data["l1-race"].values.age || "";
    set["hp"] = stats.hp;
    set["hp_max"] = stats.hp;
    set["l1mancer_status"] = "completed";
    set["options-class-selection"] = "0";
    if(data["l1-equipment"].values["equipment_type"] == "class") {
        _.each(data["l1-equipment"].values, function(val, name) {
            if(name.includes("class_equipment_choice")) {
                equipment = equipment.concat(val.split(" and "));
            }
        });
    } else if(data["l1-equipment"].values["equipment_type"] == "gold" && data["l1-equipment"].values["starting_gold"]) {
        set["gp"] = parseInt(data["l1-equipment"].values["starting_gold"]);
    }
    //Add skill proficiencies
    _.each(_.uniq(stats.proficiencies.skill.concat(stats.expertise)), function(prof) {
        var profName = prof.toLowerCase().replace(" " , "_");
        set[profName + "_prof"] = "(@{pb}*@{" + profName + "_type})";
        if(stats.expertise.indexOf(prof) != -1) {
            set[profName + "_type"] = 2;
        }
    });
    //Add background traits
    if(data["l1-background"].values["background_personality_choice1"] || data["l1-background"].values["background_personality_choice2"]) {
        var choice1 = data["l1-background"].values["background_personality_choice1"] || false;
        var choice2 = data["l1-background"].values["background_personality_choice2"] || false;
        choice1 = choice1 || choice2;
        if(choice1) {
            set["personality_traits"] = choice1;
        }
        if(choice2) {
            set["personality_traits"] += "\n\n" + choice2;
        }
        set["options-flag-personality"] = 0;
    }
    _.each(["ideal", "bond", "flaw"], function(type) {
        if(data["l1-background"].values["background_" + type + "_choice"]) {
            set[type + "s"] = data["l1-background"].values["background_" + type + "_choice"];
            set["options-flag-" + type + "s"] = 0;
        }
    });
    if(data["l1-background"].values["background_detail_choice"]) {
        set["background"] = _.last(data["l1-background"].values["background"].split(":")) + " (" + data["l1-background"].values["background_detail_choice"] + ")";
    }
    allDrops = allDrops.concat(makeItemData(equipment));
    totalDrops += allDrops.length;

    //erase all repeating sections
    eraseRepeating(eraseSections, function() {
        //first set is silent to prevent unwanted sheet workers
        setAttrs(silentset, {silent:true}, function() {
            //reset remaining attributes, and set ability scores/custom info
            setAttrs(clearset, function() {
                doAllDrops(allDrops, function() {
                    console.log("DOING THE FINAL SET!!");
                    setAttrs(set, function() {
                        update_skills(allSkills);
                        update_attacks("all");
                        organize_section_proficiencies();
                        if(set["cust_classname"]) {
                            update_class();
                        }
                        finishCharactermancer();
                    });
                });
            });
        });
    });
});

on("sheet:opened", function(eventinfo) {
    versioning(function() {
        if(eventinfo.sourceType === "sheetworker") {
            setAttrs({l1mancer_status: "completed"})
        }
        else {
            check_l1_mancer();
        }
    });
    // cleanup_drop_fields();
    // v2_old_values_check();
});

on("clicked:relaunch_lvl1mancer", function(eventinfo) {
    getAttrs(["l1mancer_status"], function(v) {
        if(v["l1mancer_status"] === "completed") {
            setAttrs({l1mancer_status: ""});
        }
        check_l1_mancer();
    });
});

var check_l1_mancer = function() {
    getAttrs(["class", "base_level", "strength_base","dexterity_base","constitution_base","intelligence_base","wisdom_base","charisma_base","l1mancer_status","version","charactermancer_step"], function(v) {
        if(!v["version"] || parseFloat(v["version"]) < 2.2) {
            return;
        }
        if(v["l1mancer_status"] && v["l1mancer_status"] === "completed") {
            return;
        }

        if(v["charactermancer_step"]) {
            startCharactermancer(v["charactermancer_step"]);
        }
        else {
            startCharactermancer("l1-welcome");
        }
    });
};

var upgrade_to_2_0 = function(doneupdating) {
    getAttrs(["npc","strength","dexterity","constitution","intelligence","wisdom","charisma","strength_base","dexterity_base","constitution_base","intelligence_base","wisdom_base","charisma_base","deathsavemod","death_save_mod","npc_str_save","npc_dex_save","npc_con_save","npc_int_save","npc_wis_save","npc_cha_save","npc_str_save_base","npc_dex_save_base","npc_con_save_base","npc_int_save_base","npc_wis_save_base","npc_cha_save_base","npc_acrobatics_base", "npc_animal_handling_base", "npc_technology_base", "npc_athletics_base", "npc_deception_base", "npc_lore_base", "npc_insight_base", "npc_intimidation_base", "npc_investigation_base", "npc_medicine_base", "npc_nature_base", "npc_perception_base", "npc_performance_base", "npc_persuasion_base", "npc_piloting_base", "npc_sleight_of_hand_base", "npc_stealth_base", "npc_survival_base", "npc_acrobatics", "npc_animal_handling", "npc_technology", "npc_athletics", "npc_deception", "npc_lore", "npc_insight", "npc_intimidation", "npc_investigation", "npc_medicine", "npc_nature", "npc_perception", "npc_performance", "npc_persuasion", "npc_piloting", "npc_sleight_of_hand", "npc_stealth", "npc_survival"], function(v) {
        var update = {};
        var stats = ["strength","dexterity","constitution","intelligence","wisdom","charisma"];
        var npc_stats = ["npc_str_save","npc_dex_save","npc_con_save","npc_int_save","npc_wis_save","npc_cha_save","npc_acrobatics", "npc_animal_handling", "npc_technology", "npc_athletics", "npc_deception", "npc_lore", "npc_insight", "npc_intimidation", "npc_investigation", "npc_medicine", "npc_nature", "npc_perception", "npc_performance", "npc_persuasion", "npc_piloting", "npc_sleight_of_hand", "npc_stealth", "npc_survival"];
        _.each(stats, function(attr) {
            if(v[attr] && v[attr] != "10" && v[attr + "_base"] == "10") {
                update[attr + "_base"] = v[attr];
            }

        });
        _.each(npc_stats, function(attr) {
            if(v[attr] && !isNaN(v[attr]) && v[attr + "_base"] == "") {
                update[attr + "_base"] = v[attr];
            }

        });
        if(v["deathsavemod"] && v["deathsavemod"] != "0" && v["death_save_mod"] === "0") {v["death_save_mod"] = v["deathsavemod"];};

        if(v["npc"] && v["npc"] == "1") {
            var callback = function() {
                update_attr("all");
                update_mod("strength");
                update_mod("dexterity");
                update_mod("constitution");
                update_mod("intelligence");
                update_mod("wisdom");
                update_mod("charisma");
                update_npc_action("all");
                update_npc_saves();
                update_npc_skills();
                update_initiative();
            }
        }
        else {
            var callback = function() {
                update_attr("all");
                update_mod("strength");
                update_mod("dexterity");
                update_mod("constitution");
                update_mod("intelligence");
                update_mod("wisdom");
                update_mod("charisma");
                update_all_saves();
                update_skills(["athletics", "acrobatics", "sleight_of_hand", "stealth", "technology", "lore", "investigation", "nature", "piloting", "animal_handling", "insight", "medicine", "perception", "survival","deception", "intimidation", "performance", "persuasion"]);
                update_tool("all")
                update_attacks("all");
                update_pb();
                update_jack_attr();
                update_initiative();
                update_weight();
                update_power_info();
                update_ac();
            }
        }

        setAttrs(update, {silent: true}, callback);
        doneupdating();
    });
};

var upgrade_to_2_1 = function(doneupdating) {
    v2_old_values_check();
    doneupdating();
};

var upgrade_to_2_2 = function(doneupdating) {
    setAttrs({l1mancer_status: "completed"}, function(eventinfo) {
        setAttrs({"options-class-selection":"0"});
        console.log("Preprocessed v2.2 upgrade");
        update_tool("all");
        update_attacks("all");
        update_class();
        update_race_display();
        doneupdating();
    });
};

var upgrade_to_2_3 = function(doneupdating) {
    getSectionIDs("damagemod", function(ids) {
        var update = {};
        _.each(ids, function(rowid) {
            update[`repeating_damagemod_${rowid}_options-flag`] = "0";
        });
        getSectionIDs("tohitmod", function(ids) {
            _.each(ids, function(rowid) {
                update[`repeating_tohitmod_${rowid}_options-flag`] = "0";
            });
            setAttrs(update);
            doneupdating();
        });
    });
};

var upgrade_to_2_4 = function(doneupdating) {
    clear_npc_power_attacks(function() {
        update_globalskills(function() {
            update_globalsaves(function() {
                update_globalattack(function() {
                    update_globaldamage(function() {
                        getAttrs(["npc", "npcpowercastingflag", "powercasting_ability", "caster_level", "level_calculations"], function(v) {
                            if(v.npc == "1" && v.npcpowercastingflag == "1") {
                                getSectionIDs("npctrait", function(secIds) {
                                    var getList = [];
                                    _.each(secIds, function(x) {
                                        getList.push("repeating_npctrait_" + x + "_name");
                                        getList.push("repeating_npctrait_" + x + "_desc");
                                    });
                                    getAttrs(getList, function(traits) {
                                        var update = {};
                                        if(v.powercasting_ability == "0*" || v.caster_level == "0") {
                                            var powerSec = "";
                                            if (v.powercasting_ability == "0*") {
                                                update.powercasting_ability = "@{intelligence_mod}+";
                                            }
                                            _.each(secIds, function(traitId) {
                                                if(traits["repeating_npctrait_" + traitId + "_name"].toLowerCase().includes("powercasting.")) powerSec = traitId;
                                            });
                                            if(powerSec  != "") {
                                                var powercasting = traits["repeating_npctrait_" + powerSec + "_desc"].toLowerCase();
                                                if (v.powercasting_ability == "0*") {
                                                    var lastIndex = 9999;
                                                    _.each(["intelligence", "wisdom", "charisma"], function(ability) {
                                                        var found = powercasting.indexOf(ability);
                                                        if(found > -1 && found < lastIndex) {
                                                            lastIndex = found;
                                                            update.powercasting_ability = "@{" + ability + "_mod}+";
                                                        }
                                                    });
                                                }
                                                if (v.caster_level == "0") {
                                                    var foundLevelidx = powercasting.search(/(\d|\d\d)(st|nd|rd|th)/);
                                                    if (foundLevelidx) {
                                                        var level = parseInt(powercasting.substring(foundLevelidx, foundLevelidx+4));
                                                        console.log(`Found powercasting level ${level} in trait, setting caster_level...`);
                                                        update.caster_level = level;
                                                    }
                                                }
                                            }
                                        }
                                        setAttrs(update, function() {
                                            // Recalculate power slots in case NPC level was restored
                                            if(!v["level_calculations"] || v["level_calculations"] == "on") {
                                                update_power_slots();
                                            };
                                            // Set all powers without a given modifier to 'power'
                                            var spgetList = [];
                                            getSectionIDs("power-cantrip", function(secIds0) {
                                                _.each(secIds0, function(x) {
                                                    spgetList.push("repeating_power-cantrip_" + x + "_power_ability");
                                                });
                                                getSectionIDs("power-1", function(secIds1) {
                                                    _.each(secIds1, function(x) {
                                                        spgetList.push("repeating_power-1_" + x + "_power_ability");
                                                    });
                                                    getSectionIDs("power-2", function(secIds2) {
                                                        _.each(secIds2, function(x) {
                                                            spgetList.push("repeating_power-2_" + x + "_power_ability");
                                                        });
                                                        getSectionIDs("power-3", function(secIds3) {
                                                            _.each(secIds3, function(x) {
                                                                spgetList.push("repeating_power-3_" + x + "_power_ability");
                                                            });
                                                            getSectionIDs("power-4", function(secIds4) {
                                                                _.each(secIds4, function(x) {
                                                                    spgetList.push("repeating_power-4_" + x + "_power_ability");
                                                                });
                                                                getSectionIDs("power-5", function(secIds5) {
                                                                    _.each(secIds5, function(x) {
                                                                        spgetList.push("repeating_power-5_" + x + "_power_ability");
                                                                    });
                                                                    getSectionIDs("power-6", function(secIds6) {
                                                                        _.each(secIds6, function(x) {
                                                                            spgetList.push("repeating_power-6_" + x + "_power_ability");
                                                                        });
                                                                        getSectionIDs("power-7", function(secIds7) {
                                                                            _.each(secIds7, function(x) {
                                                                                spgetList.push("repeating_power-7_" + x + "_power_ability");
                                                                            });
                                                                            getSectionIDs("power-8", function(secIds8) {
                                                                                _.each(secIds8, function(x) {
                                                                                    spgetList.push("repeating_power-8_" + x + "_power_ability");
                                                                                });
                                                                                getSectionIDs("power-9", function(secIds9) {
                                                                                    _.each(secIds9, function(x) {
                                                                                        spgetList.push("repeating_power-9_" + x + "_power_ability");
                                                                                    });
                                                                                    getAttrs(spgetList, function(powerAbilities) {
                                                                                        spupdate = {};
                                                                                        _.each(powerAbilities, function(ability, attributeName) {
                                                                                            if (ability == "0*") {
                                                                                                console.log("UPDATING POWER: " + attributeName);
                                                                                                spupdate[attributeName] = "power";
                                                                                            }
                                                                                        });
                                                                                        setAttrs(spupdate, function() {
                                                                                            update_attacks("powers");
                                                                                            update_challenge();
                                                                                            doneupdating();
                                                                                        });
                                                                                    });
                                                                                });
                                                                            });
                                                                        });
                                                                    });
                                                                });
                                                            });
                                                        });
                                                    });
                                                });
                                            });
                                        });
                                    });
                                });
                            } else if(v.npc != "1") {
                                doneupdating();
                            } else {
                                doneupdating();
                            }
                        });
                    });
                });
            });
        });
    });
};

var no_version_bugfix = function(doneupdating) {
    getAttrs(["npc","class"], function(v) {
        if(v["npc"] && v["npc"] != "0" || v["class"] && v["class"] != "") {
            setAttrs({version: "2.1"});
        }
        else {
            setAttrs({version: "2.3"}, {silent: true});
        }
    });
    doneupdating();
};

var versioning = function(finished) {
    getAttrs(["version"], function(v) {
        if(v["version"] === "2.5") {
            setAttrs({version: "2.5"}, function(){
                finished();
            });
            console.log("5th Edition OGL by Roll20 v" + v["version"]);
            return;
        }
        else if(!v["version"] || v["version"] === "") {
            console.log("NO VERSION FOUND");
            no_version_bugfix(function() {
                versioning(finished);
            });
        }
        else if(v["version"] === "2.4") {
            console.log("UPGRADING TO v2.5");
            setAttrs({version: "2.5"}, function(){
                finished();
            });
            console.log("5th Edition OGL by Roll20 v" + v["version"]);
        }
        else if(v["version"] === "2.3") {
            console.log("UPGRADING TO v2.4");
            upgrade_to_2_4(function() {
                setAttrs({version: "2.4"});
                versioning(finished);
            });
        }
        else if(v["version"] === "2.2") {
            console.log("UPGRADING TO v2.3");
            upgrade_to_2_3(function() {
                setAttrs({version: "2.3"});
                versioning(finished);
            });
        }
        else if(v["version"] === "2.1") {
            console.log("UPGRADING TO v2.2");
            upgrade_to_2_2(function() {
                setAttrs({version: "2.2"});
                versioning(finished);
            });
        }
        else if(v["version"] === "2.0") {
            console.log("UPGRADING TO v2.1");
            upgrade_to_2_1(function() {
                setAttrs({version: "2.1"});
                versioning(finished);
            });
        }
        else {
            console.log("UPGRADING TO v2.0");
            upgrade_to_2_0(function() {
                setAttrs({version: "2.0"});
                versioning(finished);
            });
        };
    });
};


var v2_old_values_check = function() {
    // update_attacks("all");
    var update = {};
    var attrs = ["simpletraits","features_and_traits","initiative_bonus","npc","character_id"];
    getSectionIDs("repeating_power-npc", function(idarray) {
        _.each(idarray, function(id) {
            attrs.push("repeating_power-npc_" + id + "_rollcontent");
        });
        getAttrs(attrs, function(v) {
            if(v["npc"] && v["npc"] == 1 && (!v["initiative_bonus"] || v["initiative_bonus"] == 0)) {
                update_initiative();
            }
            var powerflag = idarray && idarray.length > 0 ? 1 : 0;
            var missing = v["features_and_traits"] && v["simpletraits"] === "complex" ? 1 : 0;
            update["npcpower_flag"] = powerflag;
            update["missing_info"] = missing;
            _.each(idarray, function(id) {
                var content = v["repeating_power-npc_" + id + "_rollcontent"];
                if(content.substring(0,3) === "%{-" && content.substring(22,41) === "|repeating_attack_-" && content.substring(60,68) === "_attack}") {
                    var thisid = content.substring(2,21);
                    if(thisid != v["character_id"]) {
                        update["repeating_power-npc_" + id + "_rollcontent"] = content.substring(0,2) + v["character_id"] + content.substring(22,68);
                    }
                }
            });
            setAttrs(update);
        });

    });

};

var clear_npc_power_attacks = function(complete) {
    getSectionIDs("repeating_attack", function(attack_ids) {
        var getList = [];
        var done = false;
        _.each(attack_ids, function(id) {
            getList.push(`repeating_attack_${id}_powerid`);
        });
        getAttrs(getList, function(v) {
            _.each(attack_ids, function(id) {
                if (v[`repeating_attack_${id}_powerid`] && v[`repeating_attack_${id}_powerid`].indexOf("npc_") != -1) {
                    removeRepeatingRow(`repeating_attack_${id}`);
                }
            });
            complete();
        });
    });
}