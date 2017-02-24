;{
    "use strict";
    window.styleData = {};

    let iconGroupComponent = {
        props: ['groupName', 'searchText'],
        data: function () {
            return {
                emptyIcons: [],
            }
        },
        template: `
                        <div v-if="filterIcons.length" class="c-prop-icon--icon-group">
                            <div class="c-prop-icon--title">{{ groupName }}</div>
                            <div class="c-prop-icon--list">
                                <div
                                    v-for="(icon, index) in filterIcons"
                                    :index="index"
                                    :key="groupName.toLowerCase() + '_'+index"
                                    class="c-prop-icon--item"
                                    >
                                     <i :data-icon="icon" :class="getClass(icon)"></i>
                                </div>
                            </div>
                        </div>`,
        computed: {
            filterIcons: function () {
                return styleData[this.groupName]['ICONS'].filter( icon => {
                    return !this.emptyIcons.includes(icon) && icon.indexOf(this.searchText) + 1;
                });
            },
        },
        methods: {
            getClass: function(icon){
                return [
                    styleData[this.groupName]["ICON_BASE_CLASS"],
                    icon
                ];
            },
        },
        mounted: function () {
            //нужно найти пустые иконки и удалить их
            this.$el.querySelectorAll("i").forEach( item => {
                if(!item.offsetHeight) this.emptyIcons.push(item.getAttribute("data-icon"));
            });
        }
    };

    Vue.component('c-prop-icon', {
        components: {
            "icon-group": iconGroupComponent
        },
        props: ['iconSourse'],
        template: `
                <div class="c-prop-icon__popup">
                    <div class="preloader" v-if="isLoading">Загрузка шрифтов...</div>

                    <input type="text" v-model="searchText" v-if="!isLoading">
                    <template v-for="(groupName, index) in styleData">
                        <icon-group :search-text="searchText" :group-name="index" ></icon-group>
                    </template>

                </div>`,
        data: function(){
            return {
                styleData   : styleData,
                searchText  : "",
                isLoading   : true,
                errors      : []
            }
        },
        created: function () {
            for ( let iconName in this.iconSourse) {
                if(!styleData[iconName]) {
                    let iconData = this.iconSourse[iconName];
                    this.$http.get(iconData.SRC).then(response => {
                        let icons = response.body.match(new RegExp(`(${iconData.PREFIX}[a-zA_Z_1-9-]+)`, 'ig'));
                        if(!icons.length) this.errors.push( `В файле {iconData.SRC} иконки не найдены.`);
                        styleData[iconName] = iconData;
                        styleData[iconName]["ICONS"] = icons;
                        this.isLoading = false;
                    }, response => {
                        this.isLoading = false;
                        this.errors.push( `${iconData.SRC} Ошибка загрузки :(`);
                    });
                }
            }


        },
    });
};