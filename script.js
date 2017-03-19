;{
    "use strict";
    //TODO слить данные в 1 объект
    const styleData = {

    };
    let pickedIcons = [];
    const addPickedIcon = function (icon) {
        if ( pickedIcons.includes(icon) ) return;
        if(pickedIcons.length > 90) pickedIcons.pop();
        pickedIcons.unshift(icon);
        localStorage.pickedIcons = JSON.stringify(pickedIcons);
    };

    /**
     * Локальный компонент группы иконок
     */
    const iconGroupComponent = {
        props: ['groupName', 'searchText', 'selectedIcon'],
        data: function () {
            return {
                emptyIcons: styleData[this.groupName]["empty_icons"]
            }
        },
        template: ` <div v-if="filterIcons.length" class="c-prop-icon__icon-group">
                        <div class="c-prop-icon__title">{{ groupName }} ({{ groupPrefix }})</div>
                        <div class="c-prop-icon__list">
                            <div
                                v-for="(icon, index) in filterIcons"
                                :index="index"
                                :key="groupName.toLowerCase() + '_'+index"
                                :class="['c-prop-icon__item', {_selected : isSelected(icon)}]"
                                @click.prevent="selectIcon(icon)"
                                :title = "icon"
                                >
                                 <i :data-icon="icon" :class="getClass(icon, groupName)"></i>
                            </div>
                        </div>
                    </div>`,
        computed: {
            filterIcons: function () {
                return styleData[this.groupName]['ICONS'].filter( icon => {
                    return !this.emptyIcons.includes(icon) && icon.indexOf(this.searchText) + 1;
                });
            },
            groupPrefix:function () {
                return styleData[this.groupName]['PREFIX'];
            },
        },
        methods: {
            getClass: function(icon){
                return [
                    styleData[this.groupName]["ICON_BASE_CLASS"],
                    icon,
                ];
            },
            isSelected: function (icon) {
                return this.selectedIcon == styleData[this.groupName]["ICON_BASE_CLASS"]+" "+icon;
            },
            selectIcon: function(icon){
                let addIcon = styleData[this.groupName]["ICON_BASE_CLASS"]+" "+icon;
                this.$root.selectedIcon = addIcon;
                this.$parent.modalOpen = false;
                addPickedIcon(addIcon);
            }
        },
        mounted: function () {
            let searchInput = document.querySelector(".c-prop-icon__search-input");
            if(searchInput) searchInput.focus();
            //нужно найти пустые иконки и для фильтра
            if( !styleData[this.groupName]["check_empty"]) {
                styleData[this.groupName]["check_empty"] = true;
                this.$el.querySelectorAll("i").forEach( item => {
                    if(!item.offsetHeight) {
                        styleData[this.groupName]["empty_icons"].push(item.getAttribute("data-icon"));
                    }
                });

            }

        }
    };

    /**
     * Локальный компонент пикнутых иконок
     */
    const pickedIconComponent = {
        props: ['selectedIcon'],
        template: ` <div v-if="pickedIcons.length" class="c-prop-icon__icon-group">
                        <div class="c-prop-icon__title">Недавно выбранные</div>
                        <div class="c-prop-icon__list">
                            <div
                                v-for="(icon, index) in pickedIcons"
                                :index="index"
                                :key="'picked-icon_'+index"
                                :class="['c-prop-icon__item', {_selected : isSelected(icon)}]"
                                @click.prevent="selectIcon(icon)"
                                :title = "icon"
                                >
                                 <i :data-icon="icon" :class="icon"></i>
                            </div>
                        </div>
                    </div>`,
        data: function () {
            return {
                pickedIcons: pickedIcons
            }
        },
        methods: {
            isSelected: function (icon) {
                return this.selectedIcon == icon;
            },
            selectIcon: function(icon){
                this.$root.selectedIcon = icon;
                this.$parent.modalOpen = false;
                addPickedIcon(icon);
            },
        }
    };

    /**
     * Глобальный компонент
     */
    Vue.component('c-prop-icon', {
        components: {
            "icon-group": iconGroupComponent,
            'picked-icons': pickedIconComponent
        },
        props: ['iconSourse','selectedIcon'],
        template: `
                <div class="c-prop-icon">
                    <button class="c-prop-icon__button" type="button" @click.prevent="openModal()">
                        <i v-if="this.selectedIcon" :class="selectedIcon"></i>
                    </button>
                    <div class="c-prop-icon__selected-icon-text" v-if="selectedIcon">{{selectedIcon}}</div>
                    <a href="javascript:void(0);" class="c-prop-icon__clear-icon" @click.prevent="selectedIcon = ''"></a>
                    
                    <transition name="modal">
                        <div class="c-prop-icon__popup" v-if="modalOpen">
                                <div class="c-prop-icon__popup-overlay" @click.prevent="modalOpen = false"></div>
                                <div class="c-prop-icon__popup-content">
                                    <div class="c-prop-icon__header">
                                        <input class="c-prop-icon__search-input" type="text" v-model="searchText" v-if="!isLoading" autofocus :disabled="viewMode == 'pickedIcons'">
                                       
                                        <div class="c-prop-icon__change-view">
                                            <a :class="{_selected: viewMode == 'search' }" href="javascript:void(0);" @click.prevent="viewMode = 'search'">Все</a>
                                            <a :class="[{_selected: viewMode == 'pickedIcons'}, { _disabled: !pickedIcons.length }]" href="javascript:void(0);" @click.prevent="viewMode = 'pickedIcons'">Недавно выбранные</a>
                                        </div>
                                    </div>
                                                                        
                                    <div class="c-prop-icon__input-group-wrap">
                                        <div class="preloader" v-if="isLoading">Загрузка шрифтов...</div>
                                        <icon-group 
                                            v-for="(groupName, index) in styleData" 
                                            :search-text="searchText" 
                                            :selected-icon="selectedIcon"
                                            :group-name="index" 
                                            :key = "'icongroup_'+index"
                                            v-if = "viewMode == 'search'"
                                            ></icon-group>
                                         <picked-icons
                                            :selected-icon="selectedIcon"
                                            v-if = "viewMode == 'pickedIcons'"
                                            :picked-icons = "pickedIcons"
                                         >
                                         
                                        </picked-icons>   
                                    </div>
                                </div>
                        </div>
                    </transition>
                </div>`,
        data: function(){
            return {
                modalOpen   : false,
                styleData   : styleData,
                searchText  : "",
                isLoading   : 0,
                errors      : [],
                viewMode    : "search",
                pickedIcons : pickedIcons
            }
        },
        methods: {
            openModal: function () {
                this.modalOpen = true;
            },
        },
        created: function () {
            //Добавим иконки в объект данных
            for ( let iconData of this.iconSourse) {
                let iconName = iconData.NAME;
                if(!styleData[iconName]) {
                    styleData[iconName] = {};
                    this.isLoading++;
                    this.$http.get(iconData.SRC).then(response => {
                        let icons = response.body.match(new RegExp(`(${iconData.PREFIX}[a-zA_Z_0-9-]+)`, 'ig'));
                        if(!icons.length) this.errors.push( `В файле {iconData.SRC} иконки не найдены.`);
                        styleData[iconName] = iconData;
                        styleData[iconName]["empty_icons"] = [];
                        styleData[iconName]["check_empty"] = false;
                        styleData[iconName]["ICONS"] = icons;
                        this.isLoading--;
                    }, response => {
                        this.isLoading--;
                        this.errors.push( `${iconData.SRC} Ошибка загрузки :(`);
                    });
                }
            }
            if ( !!localStorage.pickedIcons ) {
                pickedIcons = JSON.parse( localStorage.pickedIcons );
                this.pickedIcons = pickedIcons;
            }
        },
    });
};