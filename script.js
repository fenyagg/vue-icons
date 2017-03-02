;{
    "use strict";
    const styleData = {};

    let iconGroupComponent = {
        props: ['groupName', 'searchText', 'selectedIcon'],
        data: function () {
            return {
                emptyIcons: styleData[this.groupName]["empty_icons"],
            }
        },
        template: ` <div v-if="filterIcons.length" class="c-prop-icon--icon-group">
                        <div class="c-prop-icon--title">{{ groupName }} ({{ groupPrefix }})</div>
                        <div class="c-prop-icon--list">
                            <div
                                v-for="(icon, index) in filterIcons"
                                :index="index"
                                :key="groupName.toLowerCase() + '_'+index"
                                :class="['c-prop-icon--item', {_selected : isSelected(icon)}]"
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
                this.$parent.selectedIcon = styleData[this.groupName]["ICON_BASE_CLASS"]+" "+icon;
                this.$parent.modalOpen = false;
            }
        },
        mounted: function () {
            let searchInput = document.querySelector(".c-prop-icon--search-input");
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


    Vue.component('c-prop-icon', {
        components: {
            "icon-group": iconGroupComponent,
        },
        props: ['iconSourse'],
        template: `
                <div class="c-prop-icon"">
                    <button class="c-prop-icon--button" type="button" @click.prevent="openModal()">
                        <i v-if="this.selectedIcon" :class="selectedIcon"></i>
                    </button>
                    <div class="c-prop-icon--selected-icon-text" v-if="selectedIcon">{{selectedIcon}}</div>
                    <a href="javascript:void(0);" class="c-prop-icon--clear-icon" @click.prevent="selectedIcon = ''"></a>
                    
                    <transition name="modal">
                        <div class="c-prop-icon--popup" v-if="modalOpen">
                                <div class="c-prop-icon--popup-overlay" @click.prevent="modalOpen = false"></div>
                                <div class="c-prop-icon--popup-content">
                                    <div class="preloader" v-if="isLoading">Загрузка шрифтов...</div>
                
                                    <input class="c-prop-icon--search-input" type="text" v-model="searchText" v-if="!isLoading" autofocus>
                                    <div class="c-prop-icon--input-group-wrap">
                                        <icon-group 
                                            v-for="(groupName, index) in styleData" 
                                            :search-text="searchText" 
                                            :selected-icon="selectedIcon"
                                            :group-name="index" 
                                            :key="'icongroup_'+index"
                                            ></icon-group>
                                    </div>
                                </div>
                        </div>
                    </transition>
                </div>`,
        data: function(){
            return {
                selectedIcon: "",
                modalOpen   : false,
                styleData   : styleData,
                searchText  : "",
                isLoading   : 0,
                errors      : []
            }
        },
        methods: {
            openModal: function () {
                this.modalOpen = true;
            },
        },
        created: function () {
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
        },
    });
};