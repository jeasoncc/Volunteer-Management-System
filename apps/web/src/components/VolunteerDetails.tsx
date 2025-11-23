import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Volunteer } from "@/types";
import { 
    User, Phone, Mail, MapPin, Calendar, 
    Heart, GraduationCap, Users, Clock, 
    CreditCard, Contact, FileText, Shield,
    Sparkles, BookOpen, Scroll, UserCog, 
    HeartHandshake, Briefcase, CalendarClock, 
    Activity, ThumbsUp, MessageSquare, Palette,
    Fingerprint
} from "lucide-react";

interface VolunteerDetailsProps {
    volunteer: Volunteer;
}

// 辅助函数：生成头像背景色
const getAvatarColor = (name: string) => {
    if (!name) return "bg-gray-500";
    const colors = [
        "bg-red-500", "bg-orange-500", "bg-amber-500", "bg-yellow-500", 
        "bg-lime-500", "bg-green-500", "bg-emerald-500", "bg-teal-500",
        "bg-cyan-500", "bg-sky-500", "bg-blue-500", "bg-indigo-500", 
        "bg-violet-500", "bg-purple-500", "bg-fuchsia-500", "bg-pink-500", "bg-rose-500"
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
};

// 日期格式化
const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    try {
        return dateString.split("T")[0];
    } catch (e) {
        return dateString;
    }
};

// 映射配置
const genderMap: Record<string, string> = { male: "男", female: "女", other: "其他" };
const educationMap: Record<string, string> = {
    none: "无", elementary: "小学", middle_school: "初中", high_school: "高中",
    bachelor: "本科", master: "硕士", phd: "博士", other: "其他"
};
const refugeMap: Record<string, string> = {
    none: "未皈依", took_refuge: "已皈依", five_precepts: "受五戒", bodhisattva: "菩萨戒"
};
const roleMap: Record<string, string> = { admin: "管理员", volunteer: "义工" };
const statusMap: Record<string, { label: string, variant: "default" | "secondary" | "destructive" | "outline" }> = {
    registered: { label: "已注册", variant: "outline" },
    trainee: { label: "培训中", variant: "outline" },
    applicant: { label: "申请中", variant: "outline" },
    inactive: { label: "未激活", variant: "secondary" },
    suspended: { label: "已暂停", variant: "destructive" },
};

const positionMap: Record<string, string> = {
    kitchen: "厨房",
    chanting: "助念",
    cleaning: "清洁",
    reception: "接待",
    security: "安保",
    office: "办公室",
    other: "其他"
};

const religiousMap: Record<string, string> = {
    upasaka: "居士（男）",
    upasika: "居士（女）",
    sramanera: "沙弥",
    sramanerika: "沙弥尼",
    bhikkhu: "比丘",
    bhikkhuni: "比丘尼",
    anagarika: "净人",
    buddhist_visitor: "访客",
    none: "无"
};

const healthMap: Record<string, string> = {
    healthy: "健康",
    has_chronic_disease: "有慢性病",
    has_disability: "有残疾",
    has_allergies: "有过敏",
    recovering_from_illness: "恢复中",
    other_conditions: "其他情况"
};

const consentMap: Record<string, string> = {
    approved: "同意",
    partial: "部分同意",
    rejected: "不同意",
    self_decided: "自主决定"
};

function DetailItem({ icon: Icon, label, value, className }: { icon?: any, label: string, value?: string | React.ReactNode, className?: string }) {
    return (
        <div className={`grid grid-cols-[100px_1fr] items-start gap-2 text-sm ${className}`}>
            <span className="text-muted-foreground flex items-center gap-2">
                {Icon && <Icon className="h-3.5 w-3.5" />}
                {label}
            </span>
            <span className="font-medium text-foreground break-words whitespace-pre-wrap">{value || "-"}</span>
        </div>
    );
}

export function VolunteerDetails({ volunteer }: VolunteerDetailsProps) {
    const statusConfig = statusMap[volunteer.volunteerStatus || "applicant"] || { label: volunteer.volunteerStatus, variant: "secondary" };

    return (
        <div className="space-y-6 pb-4">
            {/* 头部摘要 */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 p-6 bg-muted/30 rounded-lg border shadow-sm">
                <Avatar className="h-24 w-24 border-4 border-background shadow-md">
                    <AvatarImage src={volunteer.avatar} />
                    <AvatarFallback className={`${getAvatarColor(volunteer.name)} text-white text-3xl font-bold`}>
                        {volunteer.name?.slice(0, 1)}
                    </AvatarFallback>
                </Avatar>
                <div className="space-y-3 text-center sm:text-left flex-1">
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                        <h2 className="text-3xl font-serif font-bold text-foreground tracking-tight">{volunteer.name}</h2>
                        <div className="flex gap-2">
                            <Badge variant={statusConfig.variant as any} className="px-2 py-0.5 text-xs font-normal">{statusConfig.label}</Badge>
                            <Badge variant="secondary" className="px-2 py-0.5 text-xs font-normal">{roleMap[volunteer.lotusRole] || "义工"}</Badge>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2 text-sm text-muted-foreground">
                        <span className="flex items-center justify-center sm:justify-start gap-2"><CreditCard className="h-4 w-4" /> ID: <span className="font-mono">{volunteer.lotusId}</span></span>
                        <span className="flex items-center justify-center sm:justify-start gap-2"><Users className="h-4 w-4" /> {genderMap[volunteer.gender] || "未知"}</span>
                        {volunteer.birthDate && <span className="flex items-center justify-center sm:justify-start gap-2"><Calendar className="h-4 w-4" /> {formatDate(volunteer.birthDate)}</span>}
                    </div>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* 联系信息 - 跨两列以容纳长地址 */}
                <Card className="border-l-4 border-l-primary shadow-sm md:col-span-2">
                    <CardHeader className="pb-3 bg-muted/10">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Contact className="h-4 w-4 text-primary" />
                            联系信息
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                            <DetailItem icon={Fingerprint} label="深圳义工号" value={volunteer.volunteerId} className="font-mono" />
                            <DetailItem icon={Phone} label="手机号" value={volunteer.phone} />
                            <DetailItem icon={CreditCard} label="身份证" value={volunteer.idNumber} />
                            <DetailItem icon={Mail} label="邮箱" value={volunteer.email} />
                            <DetailItem 
                                icon={Users} 
                                label="紧急联系" 
                                value={volunteer.emergencyContact} 
                                className="text-red-600 dark:text-red-400"
                            />
                            <DetailItem icon={MapPin} label="地址" value={volunteer.address} className="md:col-span-2" />
                        </div>
                    </CardContent>
                </Card>

                {/* 佛教与信仰 */}
                <Card className="border-l-4 border-l-blue-500 shadow-sm">
                    <CardHeader className="pb-3 bg-muted/10">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Heart className="h-4 w-4 text-blue-500" />
                            佛教与信仰
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-3">
                        <DetailItem icon={Sparkles} label="法名" value={volunteer.dharmaName} />
                        <DetailItem icon={GraduationCap} label="学历" value={educationMap[volunteer.education] || volunteer.education} />
                        <DetailItem icon={Scroll} label="皈依状态" value={refugeMap[volunteer.refugeStatus] || volunteer.refugeStatus} />
                        <DetailItem icon={UserCog} label="宗教身份" value={religiousMap[volunteer.religiousBackground] || volunteer.religiousBackground} />
                        <DetailItem icon={HeartHandshake} label="是否信佛" value={volunteer.hasBuddhismFaith ? "是" : "否"} />
                    </CardContent>
                </Card>

                {/* 义工服务 */}
                <Card className="border-l-4 border-l-green-500 shadow-sm">
                    <CardHeader className="pb-3 bg-muted/10">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Shield className="h-4 w-4 text-green-500" />
                            义工服务
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-3">
                        <DetailItem icon={Briefcase} label="服务岗位" value={positionMap[volunteer.severPosition] || volunteer.severPosition} />
                        <DetailItem icon={CalendarClock} label="服务时间" value={volunteer.availableTimes} />
                        <DetailItem icon={Activity} label="健康状况" value={healthMap[volunteer.healthConditions] || volunteer.healthConditions} />
                        <DetailItem icon={ThumbsUp} label="家属同意" value={consentMap[volunteer.familyConsent] || volunteer.familyConsent} />
                        <DetailItem icon={Clock} label="加入时间" value={formatDate(volunteer.createdAt)} />
                    </CardContent>
                </Card>

                {/* 其他信息 */}
                <Card className="border-l-4 border-l-orange-500 shadow-sm md:col-span-2">
                    <CardHeader className="pb-3 bg-muted/10">
                        <CardTitle className="text-base flex items-center gap-2">
                            <FileText className="h-4 w-4 text-orange-500" />
                            其他信息
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-4">
                        <div>
                            <span className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                                <MessageSquare className="h-3.5 w-3.5" />
                                加入原因
                            </span>
                            <p className="text-sm bg-muted/30 p-3 rounded-md text-foreground leading-relaxed">
                                {volunteer.joinReason || "未填写"}
                            </p>
                        </div>
                        <div>
                            <span className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                                <Palette className="h-3.5 w-3.5" />
                                爱好特长
                            </span>
                            <p className="text-sm bg-muted/30 p-3 rounded-md text-foreground leading-relaxed">
                                {volunteer.hobbies || "未填写"}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
